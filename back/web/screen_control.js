let screenControl = function() {
  return {
    setScrollTop(offsetTop) {
      document.querySelector("#viewerContainer").scrollTop = offsetTop;
      document.querySelector("#viewerContainer").dispatchEvent(new Event('scroll'))
    },
    setScrollLeft(offsetLeft) {
      document.querySelector("#viewerContainer").scrollLeft = offsetLeft;
      document.querySelector("#viewerContainer").dispatchEvent(new Event('scroll'))
    }
  }
}()

export {screenControl};