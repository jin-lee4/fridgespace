// test axios
axios.get("https://fridge-rest-api.herokuapp.com/elements")
    .then((response) => {
        console.log(response);
    }, (error) => {
        console.log(error);
    });

const DEFAULT_BG_COLOR = "#e9a5bd";

function retrieveElements() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('address')) {
        console.log(urlParams.get('address'));
    }

    axios.get("https://fridge-rest-api.herokuapp.com/elements")
        .then((response) => {
            response.data.forEach(buildElementFromJSON)
        }, (error) => {
            console.log(error);
        });
}

function buildElementFromJSON(obj) {
    createInteractable(obj.x, obj.y, obj.width, obj.height, obj.value, obj.bgColor, obj._id);
}

retrieveElements();

function patchText(note) {
    // first get dbid attribute, e.g.
    var dbid = note.getAttribute("dbid")

// send http request
    axios.patch("https://fridge-rest-api.herokuapp.com/elements/" + dbid, {
        // insert the values u wanna update here, e.g.
        // "x": this.x
        value: note.children.item(0).value

    })
.catch((error) => {
        console.log(error);
    });
}

// target elements with the "draggable" class
interact('.resize-drag')
    .resizable({
        // resize from all edges and corners
        edges: {left: true, right: true, bottom: true, top: true},

        listeners: {
            move(event) {
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

                var dbid = target.getAttribute('dbid')
                axios.patch("https://fridge-rest-api.herokuapp.com/elements/" + dbid, {
                    // insert the values u wanna update here, e.g.
                    // "x": this.x
                    x: parseInt(target.style.left.substring(0,target.style.left.length-2)) + x + 'px',
                    y: parseInt(target.style.top.substring(0,target.style.top.length-2)) + y + 'px',
                    width: target.style.width,
                    height: target.style.height

                });
            }
        },
        modifiers: [
            // keep the edges inside the parent
            interact.modifiers.restrictEdges({
                outer: 'parent'
            }),

            // minimum size
            interact.modifiers.restrictSize({
                min: {width: 160, height: 150},
                max: {width: 700, height: 700}
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

function dragMoveListener(event) {
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

    var dbid = target.getAttribute('dbid')
    axios.patch("https://fridge-rest-api.herokuapp.com/elements/" + dbid, {
        // insert the values u wanna update here, e.g.
        // "x": this.x
        x: parseInt(target.style.left.substring(0,target.style.left.length-2)) + x + 'px',
        y: parseInt(target.style.top.substring(0,target.style.top.length-2)) + y + 'px',
    });
}

// this function is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener

//deleting an element
function deleteInteractable(elm) {
  elm.remove();
  var dbid = elm.getAttribute('dbid');
  axios.delete("https://fridge-rest-api.herokuapp.com/elements/" + dbid);
}

function createInteractable(xpos, ypos, width, height, text, color, dbid) {
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
    draggable.setAttribute('oninput', "patchText(this)")
    draggable.style.backgroundColor = color

    var deleteIcon = document.createElement("I")
    deleteIcon.setAttribute("class", "bi bi-trash")
    deleteIcon.setAttribute("onClick", "deleteInteractable(this.parentElement)")
    deleteIcon.style.padding = "2px"
    deleteIcon.style.left = "5px"
    deleteIcon.style.top = "2px"
    deleteIcon.style.position = "absolute"

    var changeIcon = document.createElement("I")
    changeIcon.setAttribute("clickCounter", "0")
    changeIcon.setAttribute("class", "bi bi-palette")
    changeIcon.setAttribute("onClick", "changeNoteColor(this.parentElement, this)")
    changeIcon.style.padding = "2px"
    changeIcon.style.right = "10px"
    changeIcon.style.top = "2px"
    changeIcon.style.position = "absolute"

    var colorPicker = document.createElement("INPUT")
    colorPicker.type = "color"
    colorPicker.className = "noteColor"
    colorPicker.style.padding = "2px"
    colorPicker.style.right = "25px"
    colorPicker.style.width = "20px"
    colorPicker.style.position = "absolute"

    var inpt = document.createElement("TEXTAREA")
    inpt.textContent = text
    inpt.setAttribute("id", "textarea")
    inpt.style.padding = "5px"
    inpt.style.backgroundColor = color;

    draggable.style.position = "absolute"
    draggable.style.top = ypos
    draggable.style.left = xpos

    draggable.appendChild(inpt)
    draggable.appendChild(deleteIcon)
    draggable.appendChild(changeIcon)
    changeIcon.appendChild(colorPicker)
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
            "bgColor": DEFAULT_BG_COLOR,
            "value": ""
        })
        .then((response) => {
            var dbid = response.data._id;
            createInteractable(randXpos, randYpos, "25%", "20%", "", DEFAULT_BG_COLOR, dbid);
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

    var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    return height;
}

function getWidth() {
    var body = document.body,
        html = document.documentElement;

    var width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
    return width;
}

function changeBackgroundColor() {
    var color = document.getElementById('inputColorPicker').value
    document.body.style.backgroundColor = color;
}

function changeNoteColor(elm, button) {
    clickCounter = parseInt(button.getAttribute('clickcounter'))
    if (clickCounter>0) {
        var color = elm.getElementsByClassName('noteColor').item(0).value
        var textarea = elm.childNodes[0]
        elm.style.backgroundColor = color;
        textarea.style.backgroundColor = color;

        var dbid = elm.getAttribute("dbid");
        axios.patch("https://fridge-rest-api.herokuapp.com/elements/" + dbid, {
        // insert the values u wanna update here, e.g.
        // "x": this.x
            bgColor: color

        })

    }
    button.setAttribute('clickcounter',"1")
}
