// target elements with the "draggable" class
interact('.resize-drag')
  .resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },

      listeners: {
        move (event) {
          var target = event.target
          var insideElements = target.children
          var x = (parseFloat(target.getAttribute('data-x')) || 0)
          var y = (parseFloat(target.getAttribute('data-y')) || 0)

          // update the element's style
          target.style.width = event.rect.width + 'px'
          target.style.height = event.rect.height + 'px'

          // translate when resizing from top or left edges
          x += event.deltaRect.left
          y += event.deltaRect.top

          target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)'

          target.setAttribute('data-x', x)
          target.setAttribute('data-y', y)
          target.children = insideElements
        }
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent'
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: 160, height: 150 },
          max: { width: 700, height: 700 }
        })
      ],

      inertia: true
    })

    .draggable({
        // enable inertial throwing
        inertia: true,
        // keep the element within the area of it's parent
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ],
        // enable autoScroll
        autoScroll: true,

        listeners: {
            // call this function on every dragmove event
            move: dragMoveListener
        }
    })

function dragMoveListener (event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

    // translate the element
    target.style.webkitTransform =
        target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)'

    // update the position attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
}

// this function is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener

//deleting an element
function deleteInteractable(elm) {
  elm.parentElement.remove();
}

function createInteractable() {
    var draggable = document.createElement("DIV")
    draggable.classList.add("resize-drag")
    draggable.style.display = "flex"
    draggable.style.flexWrap = "wrap"
    draggable.style.justifyContent = "center"
    draggable.style.alignItems = "center"
    draggable.style.height = "100px"

    var btn = document.createElement("BUTTON")
    btn.setAttribute("onClick","deleteInteractable(this)")
    btn.innerText = "click here 2 delete"
    btn.style.bottom = "5px"
    btn.style.position = "center"


    var inpt = document.createElement("TEXTAREA")

    var body = document.body,
        html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight ) * 0.8;
    var width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth ) * 0.75;

    draggable.style.position = "absolute"
    draggable.style.top = getRandomInt(50, height) + "px"
    draggable.style.left = getRandomInt(0, width) + "px"

    draggable.appendChild(inpt)
    draggable.appendChild(btn)
    document.body.appendChild(draggable)
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
