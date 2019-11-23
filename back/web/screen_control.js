let screenControl = function() {
  return {
    setScrollTop(offsetTop) {
      document.querySelector("#viewerContainer").scrollTop = offsetTop;
      document.querySelector("#viewerContainer").dispatchEvent(new Event('scroll'))
    },
    setScrollLeft(offsetLeft) {
      document.querySelector("#viewerContainer").scrollLeft = offsetLeft;
      document.querySelector("#viewerContainer").dispatchEvent(new Event('scroll'))
    },
    setScrollWidth(offsetWidth) {
      document.querySelector("#viewerContainer").style.offsetWidth = offsetWidth;
      document.querySelector("#viewerContainer").dispatchEvent(new Event('scroll'))
    },
    setScrollHeight(offsetHeight) {
      document.querySelector("#viewerContainer").style.offsetHeight = offsetHeight + 64;
      document.querySelector("#viewerContainer").dispatchEvent(new Event('scroll'))
    }
  }
}()

export {screenControl};