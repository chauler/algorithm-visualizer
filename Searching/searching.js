import { dragElement, ResizeHandler } from "../js/draggableCard.js"
import { Action } from "../js/Action.js"
import { Alert } from "../js/Alert.js"
import { CheckFirstVisit } from "../js/Cookies.js"
import anime from "../js/anime.es.js"
import { PageAlgorithm, DisplayAnnotation } from "../js/SetAlgorithm.js";
import { AnimationController } from "../js/AnimationController.js";

//let selectedFunction = (new URLSearchParams(window.location.search)).get("func")
let input = []
let x
let inProgress = false
let playing = false
const alertContainer = document.getElementById('alertContainer')

const pageAlgorithm = new PageAlgorithm()
const animationController = new AnimationController()

window.onload = generateBox
window.onresize = generateBox
//Initialize the dropdown menu buttons
document.querySelectorAll(".LinearSearch").forEach(element => element.onclick=pageAlgorithm.changeAlgo.bind(pageAlgorithm))
document.querySelectorAll(".BinarySearch").forEach(element => element.onclick=pageAlgorithm.changeAlgo.bind(pageAlgorithm))
//Initialize searching-specific buttons
document.querySelector("#randomNumbers").addEventListener('click', randomInput)

CheckFirstVisit('searchVisited')

document.querySelector("#AnimSpeed").addEventListener("click", function() {
    animationController.speed = animationController.speeds[(animationController.speeds.indexOf(animationController.speed)+1)%animationController.speeds.length]
    this.innerHTML = `${animationController.speed}x`
})

pageAlgorithm.changeAlgo((new URLSearchParams(window.location.search)).get("func") || "LinearSearch")

// Animation ----------------------------------------------------------------
async function compareAnimation(actions) {
    //let progress = document.querySelector("#Progress-Bar");
    //let tl
    //document.querySelector("#PlayPause").onclick = function() {
    //    if(typeof tl === "undefined" || !inProgress) {
    //        console.log("No animation playing")
    //        return
    //    }
    //    if(playing) {
    //        console.log("first")
    //        playing = false
    //        tl.pause()
    //        this.firstChild.setAttribute("src", "../Assets/play-fill.svg")
    //    }
    //    else {
    //        console.log("second")
    //        playing = true
    //        tl.play()
    //        this.firstChild.setAttribute("src", "../Assets/pause-fill.svg")
    //    }
    //}
    //
    //playing = true
    //
    //for(let action of actions) {
    //    tl = anime.timeline()
    //    DisplayAnnotation(action.annotation, document.querySelector("#annotation>.card-body>p"))
    //    action.AnimatePseudocode()
    //    action.AddToTimeline(tl)
    //    await tl.finished
    //
    //    progress.style.width = `${(actions.indexOf(action) + 1) / actions.length * 100}%`
    //}
    //
    //playing = false    
    animationController.playing = true
    await animationController.PlayAllAnimations({progressBar: document.querySelector("#Progress-Bar")})
    animationController.playing = false
}

// Action ----------------------------------------------------------------


// Functions ----------------------------------------------------------------

// gets input and splits it into an array
function getInput() {    
    let max = window.innerWidth < 768 ? 15 : 25
    max = window.innerWidth < 300 ? 10 : max
    var inputString = document.getElementById('input').value
    input = inputString.split(", ")

    input.forEach((val, i, arr) => {arr[i] = {
        value: Number(val),
        id: `#arrBox${val}`   // id="arrBoxi"
    }})
    input.sort((a,b) => a.value - b.value)
    let unique = [...new Map(input.map((m) => [m.id, m])).values()]
    console.log(unique);
    return unique.length > max ? unique.slice(0, max) : unique
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function randomInput() {
    input = []
    let inputString
    let length = getRandomIntInclusive(5, 20)
    
    inputString = getRandomIntInclusive(1, 100) + ", "
    for (let i = 0; i < length - 2; i++) {
        inputString += getRandomIntInclusive(1, 100) + ", "
    }
    inputString += getRandomIntInclusive(1, 100)

    document.querySelector("#input").value = inputString
    document.querySelector("#reset").style.display = "none"
    document.querySelector("#start").style.display = "inline"
    
    generateBox()
}

function getFindValue() {
    x = Number(document.getElementById('FindValue').value)
    x = {
        value: x,
        id: `#arrBox${x}`
    }
    return x
}

// removes existing array
function removeBox() {
    var box = document.querySelectorAll('.arrBox')
    box.forEach(element => element.remove())
}

function generateBox() {
    removeBox()
    input = getInput()
    let container = document.querySelector('#arrCanvas')
    container.style.setProperty("--columns", input.length)
    container.style.setProperty("--width", document.querySelector('#arrCanvas').clientWidth / input.length)
    for(let i = 0; i < input.length; i++) {
        let arrBox = document.createElement('div')
        let arrBoxID = 'arrBox' + input[i].value
        arrBox.innerHTML = input[i].value
        arrBox.classList.add('arrBox')
        arrBox.setAttribute('id', arrBoxID)
        arrBox.style.setProperty('--position', `${i * document.querySelector('#arrCanvas').clientWidth / input.length}`)
        arrBox.style.setProperty('--translation', 0)
        container.appendChild(arrBox)
    }
}

// prints array to console
function printArr(arr) { 
    for(let i = 0; i < arr.length; i++) {
        console.log(arr[i])
    }
}

function start() {
    if(inProgress) {
        console.log("Animation in progress, can't play")
        return
    }
    generateBox()
    inProgress = true
    getFindValue()
    animationController.animations = pageAlgorithm.selectedFunction(input, x)
    compareAnimation(animationController.animations)
    .then(function(value) {
        document.querySelector("#start").style.display = "none"
        document.querySelector("#reset").style.display = "inline"
    })
    // .catch((error) => {console.log("Error in start()")})
    .finally( function() {
        inProgress = false
    })
}

document.querySelectorAll(".draggable").forEach((element) => {dragElement(element)})
document.querySelectorAll(".resizer").forEach((element) => {ResizeHandler(element)})

document.querySelector('#start').addEventListener('click', function() {
    if(document.querySelector("#FindValue").value == "") {
        $("#warningModal").modal("show")
    } else {
        start()
    }
})
document.querySelector('#start1').addEventListener('click', function() {
    if(document.querySelector("#FindValue").value == "") {
        $("#warningModal").modal("show")
    } else {
        start()
    }
})
document.querySelector('#FindValue').addEventListener('keypress', function(e) {
    if(e.key === 'Enter') {
        e.preventDefault()
        if(document.querySelector("#FindValue").value == "") {
            $("#warningModal").modal("show")
        } else {
            document.querySelector('#start').click()
        }
    }
})
document.querySelector('#getNewInput').addEventListener('click', generateBox)
document.querySelector('#input').addEventListener('keypress', function(e) {
    if(e.key === 'Enter') {    
        e.preventDefault()
        if(document.getElementById('input').value == "") {
            document.querySelector('#randomNumbers').click()
        } else {
            document.querySelector('#getNewInput').click()
        }
    }
})
document.querySelector("#reset").addEventListener("click", function() {
    generateBox()
    document.querySelector("#Progress-Bar").style.width = "0%"
    document.querySelector("#reset").style.display = "none"
    document.querySelector("#start").style.display = "inline"
    inProgress = false;
})
document.querySelector("#PlayPause").onclick = function() {
    if(typeof animationController.currentAnim === "undefined" || !inProgress) {
        Alert(alertContainer, "No animation playing", 'warning')
        return
    }

    //Play or pause depending on current animation state, then toggle button state
    if(animationController.playing) {
        animationController.playing = false
        animationController.Pause()
        this.firstChild.setAttribute("src", "../Assets/play-fill.svg")
    }
    else {
        animationController.playing = true
        animationController.Play()
        this.firstChild.setAttribute("src", "../Assets/pause-fill.svg")
    }
}