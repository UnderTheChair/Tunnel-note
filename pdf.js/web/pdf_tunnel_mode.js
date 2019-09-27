import { normalizeWheelEventDelta } from './ui_utils';

const DELAY_BEFORE_RESETTING_SWITCH_IN_PROGRESS = 1500; // in ms
const DELAY_BEFORE_HIDING_CONTROLS = 3000; // in ms
const ACTIVE_SELECTOR = 'pdfTunnelMode';
const CONTROLS_SELECTOR = 'pdfTunnelModeControls';
const MOUSE_SCROLL_COOLDOWN_TIME = 50; // in ms
const PAGE_SWITCH_THRESHOLD = 0.1;

// Number of CSS pixels for a movement to count as a swipe.
const SWIPE_MIN_DISTANCE_THRESHOLD = 50;

// Swipe angle deviation from the x or y axis before it is not
// considered a swipe in that direction any more.
const SWIPE_ANGLE_THRESHOLD = Math.PI / 6;
/**
 * @typedef {Object} PDFTunnelModeOptions
 * @property {HTMLDivElement} container - The container for the viewer element.
 * @property {HTMLDivElement} viewer - (optional) The viewer element.
 * @property {PDFViewer} pdfViewer - The document viewer.
 * @property {EventBus} eventBus - The application event bus.
 * @property {Array} contextMenuItems - (optional) The menu items that are added
 *   to the context menu in Presentation Mode.
 */
class PDFTunnelMode {
  /**
   * @param {PDFTunnelModeOptions} options
   */
  constructor({ container, viewer = null, pdfViewer, eventBus,
              }) {
    this.container = container;
    this.viewer = viewer || container.firstElementChild;
    this.pdfViewer = pdfViewer;
    this.eventBus = eventBus;

    this.active = false;
    this.args = null;
    this.contextMenuOpen = false;
    this.mouseScrollTimeStamp = 0;
    this.mouseScrollDelta = 0;
    this.touchSwipeState = null;
  }

  /**
   * Request the browser to enter fullscreen mode.
   * @returns {boolean} Indicating if the request was successful.
   */
  request() {
    console.log('tunnel mode request');
    if (this.switchInProgress || this.active || !this.viewer.hasChildNodes()) {
      return false;
    }
    this._setSwitchInProgress();
    this._notifyStateChange();

    this.args = {
      page: this.pdfViewer.currentPageNumber,
      previousScale: this.pdfViewer.currentScaleValue,
    };

    return true;
  }

  /**
   * @private
   */
  _mouseWheel(evt) {
    if (!this.active) {
      return;
    }

    evt.preventDefault();

    let delta = normalizeWheelEventDelta(evt);
    let currentTime = (new Date()).getTime();
    let storedTime = this.mouseScrollTimeStamp;

    // If we've already switched page, avoid accidentally switching again.
    if (currentTime > storedTime &&
      currentTime - storedTime < MOUSE_SCROLL_COOLDOWN_TIME) {
      return;
    }
    // If the scroll direction changed, reset the accumulated scroll delta.
    if ((this.mouseScrollDelta > 0 && delta < 0) ||
      (this.mouseScrollDelta < 0 && delta > 0)) {
      this._resetMouseScrollState();
    }
    this.mouseScrollDelta += delta;

    if (Math.abs(this.mouseScrollDelta) >= PAGE_SWITCH_THRESHOLD) {
      let totalDelta = this.mouseScrollDelta;
      this._resetMouseScrollState();
      let success = totalDelta > 0 ? this._goToPreviousPage()
        : this._goToNextPage();
      if (success) {
        this.mouseScrollTimeStamp = currentTime;
      }
    }
  }

  /**
   * @private
   */
  _notifyStateChange() {
    this.eventBus.dispatch('tunnelmodechanged', {
      source: this,
      active: this.active,
      switchInProgress: !!this.switchInProgress,
    });
  }

  /**
   * @private
   */
  _mouseDown(evt) {
    if (this.contextMenuOpen) {
      this.contextMenuOpen = false;
      evt.preventDefault();
      return;
    }
    if (evt.button === 0) {
      // Enable clicking of links in presentation mode. Note: only links
      // pointing to destinations in the current PDF document work.
      let isInternalLink = (evt.target.href &&
        evt.target.classList.contains('internalLink'));
      if (!isInternalLink) {
        // Unless an internal link was clicked, advance one page.
        evt.preventDefault();

        if (evt.shiftKey) {
          this._goToPreviousPage();
        } else {
          this._goToNextPage();
        }
      }
    }
  }

  /**
   * Resets the properties used for tracking mouse scrolling events.
   *
   * @private
   */
  _resetMouseScrollState() {
    this.mouseScrollTimeStamp = 0;
    this.mouseScrollDelta = 0;
  }

  /**
   * @private
   */
  _touchSwipe(evt) {
    if (!this.active) {
      return;
    }
    if (evt.touches.length > 1) {
      // Multiple touch points detected; cancel the swipe.
      this.touchSwipeState = null;
      return;
    }

    switch (evt.type) {
      case 'touchstart':
        this.touchSwipeState = {
          startX: evt.touches[0].pageX,
          startY: evt.touches[0].pageY,
          endX: evt.touches[0].pageX,
          endY: evt.touches[0].pageY,
        };
        break;
      case 'touchmove':
        if (this.touchSwipeState === null) {
          return;
        }
        this.touchSwipeState.endX = evt.touches[0].pageX;
        this.touchSwipeState.endY = evt.touches[0].pageY;
        // Avoid the swipe from triggering browser gestures (Chrome in
        // particular has some sort of swipe gesture in fullscreen mode).
        evt.preventDefault();
        break;
      case 'touchend':
        if (this.touchSwipeState === null) {
          return;
        }
        let delta = 0;
        let dx = this.touchSwipeState.endX - this.touchSwipeState.startX;
        let dy = this.touchSwipeState.endY - this.touchSwipeState.startY;
        let absAngle = Math.abs(Math.atan2(dy, dx));
        if (Math.abs(dx) > SWIPE_MIN_DISTANCE_THRESHOLD &&
          (absAngle <= SWIPE_ANGLE_THRESHOLD ||
            absAngle >= (Math.PI - SWIPE_ANGLE_THRESHOLD))) {
          // Horizontal swipe.
          delta = dx;
        } else if (Math.abs(dy) > SWIPE_MIN_DISTANCE_THRESHOLD &&
          Math.abs(absAngle - (Math.PI / 2)) <= SWIPE_ANGLE_THRESHOLD) {
          // Vertical swipe.
          delta = dy;
        }
        if (delta > 0) {
          this._goToPreviousPage();
        } else if (delta < 0) {
          this._goToNextPage();
        }
        break;
    }
  }

  /**
   * @private
   */
  _addWindowListeners() {
    this.showControlsBind = this._showControls.bind(this);
    this.mouseDownBind = this._mouseDown.bind(this);
    this.mouseWheelBind = this._mouseWheel.bind(this);
    this.resetMouseScrollStateBind = this._resetMouseScrollState.bind(this);
    this.contextMenuBind = this._contextMenu.bind(this);
    this.touchSwipeBind = this._touchSwipe.bind(this);

    window.addEventListener('mousemove', this.showControlsBind);
    window.addEventListener('mousedown', this.mouseDownBind);
    window.addEventListener('wheel', this.mouseWheelBind);
    window.addEventListener('keydown', this.resetMouseScrollStateBind);
    window.addEventListener('contextmenu', this.contextMenuBind);
    window.addEventListener('touchstart', this.touchSwipeBind);
    window.addEventListener('touchmove', this.touchSwipeBind);
    window.addEventListener('touchend', this.touchSwipeBind);
  }

}

export {
  PDFTunnelMode,
};
