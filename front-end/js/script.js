
// test axios
axios.get("https://fridge-rest-api.herokuapp.com/elements")
  .then((response) => {
      console.log(response);
  }, (error) => {
      console.log(error);
  });


function retrieveElements() {
  axios.get("https://fridge-rest-api.herokuapp.com/elements")
    .then((response) => {
        response.data.forEach(buildElementFromJSON)
    }, (error) => {
        console.log(error);
    });
}

function buildElementFromJSON(obj) {
    createInteractable(obj.x, obj.y, obj.width, obj.height, obj.value, obj._id);
}

retrieveElements();

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
  var dbid = elm.parentElement.getAttribute('dbid');
  axios.delete("https://fridge-rest-api.herokuapp.com/elements/" + dbid);
}

function createInteractable(xpos, ypos, width, height, text, dbid) {
    var draggable = document.createElement("DIV")

    draggable.classList.add("resize-drag")
    draggable.style.display = "flex"
    draggable.style.flexWrap = "wrap"
    draggable.style.justifyContent = "center"
    draggable.style.alignItems = "center"
    draggable.style.height = height
    draggable.style.width = width
    draggable.style.top = ypos
    draggable.style.left = xpos
    draggable.setAttribute('dbid', dbid)

    var deleteIcon = document.createElement("I")
    deleteIcon.setAttribute("class", "bi bi-trash")
    deleteIcon.setAttribute("onClick", "deleteInteractable(this)")
    deleteIcon.style.padding = "2px"
    deleteIcon.style.left = "5px"
    deleteIcon.style.top = "2px"
    deleteIcon.style.position = "absolute"

    var changeIcon = document.createElement("I")
    changeIcon.setAttribute("class", "bi bi-palette")
    changeIcon.setAttribute("onClick", "changeBackgroundColor(this)")
    changeIcon.style.padding = "2px"
    changeIcon.style.right ="5px"
    changeIcon.style.top = "2px"
    changeIcon.style.position = "absolute"

    var inpt = document.createElement("TEXTAREA")
    inpt.textContent = text
    inpt.style.padding = "5px"

    draggable.style.position = "absolute"
    draggable.style.top = ypos
    draggable.style.left = xpos

    draggable.appendChild(inpt)
    draggable.appendChild(deleteIcon)
    draggable.appendChild(changeIcon)
    document.body.appendChild(draggable)
}

function createInteractableRandom() {
    var randYpos = getRandomInt(50, getHeight() * 0.8) + "px"
    var randXpos = getRandomInt(0, getWidth() * 0.75) + "px"
    axios.post("https://fridge-rest-api.herokuapp.com/elements", 
        {
            "type": "text",
            "x": randXpos,
            "y": randYpos,
            "width": "25%",
            "height": "20%",
            "value": ""
        })
        .then((response) => {
            var dbid = response.data._id;
            createInteractable(randXpos, randYpos, "25%", "20%", "", dbid);
        })
        .catch((error) => {
            console.log(error);
        });

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

/**
 * Returns the width / height of the body
 */
function getHeight() {
    var body = document.body,
        html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
    return height;
}

function getWidth() {
    var body = document.body,
        html = document.documentElement;

        var width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
        return width;
}

function changeBackgroundColor() {
  var color = document.getElementById('inputColorPicker').value
  document.body.style.backgroundColor = color;
}
