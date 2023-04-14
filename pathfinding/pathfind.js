import { dragElement, ResizeHandler } from "../js/draggableCard.js";
import { Action } from "../js/Action.js";
import { Alert } from "../js/Alert.js"
import { CheckFirstVisit } from "../js/Cookies.js";
import anime from "../js/anime.es.js"
import { PageAlgorithm, DisplayAnnotation } from "../js/SetAlgorithm.js";
import { AnimationController } from "../js/AnimationController.js";
import { Table, Graph } from "../js/Canvas.js";

let columns = Math.floor((document.body.clientWidth / 30));
let rows = Math.floor((document.body.clientHeight / 30));
const alertContainer = document.getElementById('alertContainer')

const animationController = new AnimationController()
const pageAlgorithm = new PageAlgorithm()
const canvas = new Table()

//Initialize the card listeners
document.querySelectorAll(".draggable").forEach((element) => {dragElement(element)})
document.querySelectorAll(".resizer").forEach((element) => {ResizeHandler(element)})
//Initialize the dropdown menus
document.querySelectorAll(".AStar").forEach(element => element.onclick=element.onclick=ChangeAlgorithm)
document.querySelectorAll(".Djikstra").forEach(element => element.onclick=element.onclick=ChangeAlgorithm)

function ChangeAlgorithm(event) {
    if(animationController.inProgress) {
        animationController.CancelAnimation()
    }
    pageAlgorithm.changeAlgo.call(pageAlgorithm, event)

    //Reset call is done after a 0ms timeout to ensure it runs AFTER all promises relating to the animation resolve.
    setTimeout(()=>{Reset()}, 0)
}

CheckFirstVisit('pathVisited')

document.querySelector("#AnimSpeed").addEventListener("click", function() {
    animationController.speed = animationController.speeds[(animationController.speeds.indexOf(animationController.speed)+1)%animationController.speeds.length]
    this.innerHTML = `${animationController.speed}x`
})

pageAlgorithm.changeAlgo((new URLSearchParams(window.location.search)).get("func") || "astar")

//function cellHandler(event) {
//    document.querySelectorAll("td").forEach((node)=>{
//        node.addEventListener(event.type == "mousedown" ? "mousemove" : "touchmove", cellDrag)
//        node.addEventListener(event.type == "mousedown" ? "mouseup" : "touchend", cleanUp)
//    })
//}


function generateTable() {
    let table = document.querySelector("#grid-container")
    table.innerHTML = ""
  
    let cellSize = 30

    columns = Math.floor((window.innerWidth / cellSize));
    rows = Math.floor((window.innerHeight / cellSize));

    table.style.setProperty("--columns", columns);
    table.style.setProperty("--rows", rows);

    let width = window.innerWidth / columns
    let height = window.innerHeight / rows

    for(let y=0; y<rows; y++) {
        for(let x=0; x<columns; x++) {
            let cell = document.createElement("td")
            cell.id = (`${y},${x}`)
            cell.addEventListener('ontouchstart' in document.documentElement === true ? 'touchstart' : 'mousedown', cellHandler, {passive: false})
            //cell.addEventListener('touchstart', cellHandler)
            cell.style.setProperty("--width", width)
            cell.style.setProperty("--height", height)
            table.appendChild(cell)
        }
    }
}

window.onload = () => {
    let vh = window.innerHeight * 0.01
    document.body.style.setProperty('--vh', `${vh}px`)
    canvas.CreateTable()
}

window.onresize = () => {
    let vh = window.innerHeight * 0.01
    document.body.style.setProperty('--vh', `${vh}px`)
    canvas.UpdateTable()
}

function FindPath(table)
{
    let graph = Graph.ParseTable(document.querySelector("#grid-container"))
    if(typeof graph.start == "undefined") {
        throw new Error("Please place a start node.")
    } else if (typeof graph.end == "undefined") {
        throw new Error("Please place an end node.")
    }
    const actions = pageAlgorithm.selectedFunction(graph, graph.start, graph.end)
    if(typeof actions === "undefined") {
        throw new Error("No path was found.")
    }
    return actions
}

async function animateResults(actions) {
    animationController.playing = true
    try {
        await animationController.PlayAllAnimations({progressBar: document.querySelector("#Progress-Bar"), cancel: document.querySelector("#cancel")})
    }
    catch(err) {
        Alert(alertContainer, err.message, 'danger')
    }
    animationController.playing = false
}

function Reset() {
    //generateTable()
    canvas.CreateTable()
    document.querySelector("#Progress-Bar").style.width = "0%"
    document.querySelector("#reset").style.display = "none"
    document.querySelector("#generate").style.display = "inline"
}

document.querySelector("#generate").addEventListener("click", () => {
    //If there is already an animation, do nothing
    if(animationController.inProgress) {
        Alert(alertContainer, "Animation in progress, can't play", 'warning')
        return
    }

    //Find path
    try {
        animationController.animations = FindPath(document.querySelector("#grid-container"))
    }
    catch(error) {
        Alert(alertContainer, error.message, 'danger')
        return
    }

    //If a path was found, begin animation
    animationController.inProgress = true
    //Change Go button to Cancel button
    document.querySelector("#generate").style.display = "none"
    document.querySelector("#cancel").style.display = "inline"
    animateResults(animationController.animations)
    .then(
        function(value) {
            document.querySelector("#cancel").style.display = "none"
            document.querySelector("#reset").style.display = "inline"
    })
    .catch(
        function(error) {
            Alert(alertContainer, error.message, 'danger')
    })
    .finally(
        () => {
            animationController.inProgress = false
        }
    )
})

//Button hidden until the animation has finished.
document.querySelector("#reset").addEventListener("click", Reset)

//document.querySelector("#cancel").addEventListener("click", () => {
//    if(!animationController.inProgress) {
//        Alert(alertContainer, "No in-progress animation to cancel.", "warning")
//        return
//    }
//    animationController.CancelAnimation()
//})

document.querySelector("#PlayPause").onclick = function() {
    if(typeof animationController.currentAnim === "undefined" || !animationController.inProgress) {
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