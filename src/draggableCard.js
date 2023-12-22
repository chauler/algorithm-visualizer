function dragElement(element) {
    var deltaX = 0, deltaY = 0, startingX = 0, startingY = 0;
      element.onmousedown = dragMouseDown;

      //while(element.offsetWidth + element.offsetLeft > window.innerWidth - 20) {
      //    element.style.left = ((element.offsetLeft - 10) / window.innerWidth * 100) + "%"
      //}
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      startingX = e.clientX;
      startingY = e.clientY;
      document.addEventListener('mouseup', closeDragElement)
      // call a function whenever the cursor moves:
      document.addEventListener('mousemove', elementDrag)
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      deltaX = e.clientX - startingX;
      deltaY = e.clientY - startingY;
      startingX = e.clientX;
      startingY = e.clientY;
      // set the element's new position:
      //If deltaX is negative (moving right) & the card is about to move offscreen, cap it at the edge
      if(deltaX > 0 && element.offsetWidth + element.offsetLeft + deltaX > window.innerWidth)
      { 
          element.style.left = ((window.innerWidth - element.offsetWidth) / window.innerWidth * 100) + "%"
      }
      else if(deltaX < 0 && element.offsetLeft + deltaX < 0)
      {
        element.style.left = 0 + "%"
      }
      else //If deltaX is positive (moving left):
      {
        element.style.left = ((element.offsetLeft + deltaX) / window.innerWidth * 100) + "%"
      }
      //If deltaY is negative (moving down):
      if(deltaY > 0 && element.offsetHeight + element.offsetTop + deltaY > window.innerHeight)
      {
        element.style.top = ((window.innerHeight - element.offsetHeight) / window.innerHeight * 100) + "%"
      }
      else if(deltaY < 0 && element.offsetTop + deltaY < 0)
      {
        element.style.top = 0 + "%"
      }
      else //If deltaY is positive (moving up):
      {
        element.style.top = ((element.offsetTop + deltaY) / window.innerHeight * 100) + "%"
      }
  }
  
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.removeEventListener('mouseup', closeDragElement)
      document.removeEventListener('mousemove', elementDrag)
    }
}

function ResizeHandler(element) {

  var x =0; var y = 0; var w = 0; var h = 0;
  let minCardSize = 50

  //Listener is placed on the small "resize" indicator, but we need to modify the box itself.
  const parent = element.parentNode

  element.addEventListener('mousedown', ResizeMouseDown)
  function ResizeMouseDown(event) {
    event.stopPropagation()
    event.preventDefault()
    x = event.clientX
    y = event.clientY

    document.addEventListener('mousemove', ResizeMouseMove)
    document.addEventListener('mouseup', ResizeMouseUp)
  }

  function ResizeMouseMove(event) {
    event.stopPropagation()
    event.preventDefault()
    const deltaX = event.clientX - x
    const deltaY = event.clientY - y

    x = event.clientX
    y = event.clientY

    w = parent.offsetWidth
    h = parent.offsetHeight

    //If moving right and box's left + width + deltaX > screenSize, 
    //cap the box at the edge of the screen
    if(w + parent.offsetLeft + deltaX > window.innerWidth) {
      parent.style.width = `${window.innerWidth - parent.offsetLeft}px`
    }
    else if(w + deltaX < minCardSize)
    {
      parent.style.width = `${minCardSize}px`
    }
    else
    {
      parent.style.width = `${w + deltaX}px`
    }
    if(h + parent.offsetTop + deltaY > window.innerHeight)
    {
      parent.style.height = `${window.innerHeight - parent.offsetTop}px`
    }
    else if(h + deltaY < minCardSize)
    {
      parent.style.height = `${minCardSize}px`
    }
    else
    {
      parent.style.height = `${h + deltaY}px`
    }
  }

  function ResizeMouseUp() {
    document.removeEventListener('mousemove', ResizeMouseMove)
    document.removeEventListener('mouseup', ResizeMouseUp)
  }
}

export { dragElement, ResizeHandler }