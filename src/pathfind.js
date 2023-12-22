import { dragElement, ResizeHandler } from "./draggableCard.js";
import { Alert } from "./Alert.js"
import { CheckFirstVisit, PathfindingCookies } from "./Cookies.js";
import { PageAlgorithm, DisplayAnnotation } from "./SetAlgorithm.js";
import { AnimationController } from "./AnimationController.js";
import { Table, Graph, DFSMaze, CellHandler } from "./PathfindingCanvas.js";
import { debounce } from "./Utility.js";

const alertContainer = document.getElementById('alertContainer')

const animationController = new AnimationController()
const pageAlgorithm = new PageAlgorithm()
const canvas = new Table()

//Initialize the card listeners
document.querySelectorAll(".draggable").forEach((element) => {
    dragElement(element)
    element.style.left = (window.innerWidth - element.offsetWidth) / window.innerWidth * 100 - 1 + "%"

    window.addEventListener("resize", () => {
      element.style.left = (window.innerWidth - element.offsetWidth) / window.innerWidth * 100 - 1 + "%"
    })
})
document.querySelectorAll(".resizer").forEach((element) => {ResizeHandler(element)})

//Initialize the dropdown menus
document.querySelectorAll(".AStar").forEach(element => element.onclick=ChangeAlgorithm)
document.querySelectorAll(".Djikstra").forEach(element => element.onclick=ChangeAlgorithm)
document.querySelectorAll(".JPS").forEach(element => element.onclick=ChangeAlgorithm)

document.querySelector("#cellSizeIncrease").addEventListener('click', function(){SetCellSize(PathfindingCookies.GetCellSize()+1)})
document.querySelector("#cellSizeDecrease").addEventListener('click', function(){SetCellSize(PathfindingCookies.GetCellSize()-1)})
document.querySelector("#cellSizeInput").addEventListener('change', function(){SetCellSize(Number(this.value))})
document.querySelector("#cellSizeInput").value = PathfindingCookies.GetCellSize()

CheckFirstVisit('pathVisited')

document.querySelector("#AnimSpeed").addEventListener("click", function() {
    animationController.SetSpeed(animationController.speeds[(animationController.speeds.indexOf(animationController.speed)+1)%animationController.speeds.length])
    this.innerHTML = `${animationController.speed}x`
})

pageAlgorithm.changeAlgo((new URLSearchParams(window.location.search)).get("func") || "astar")

window.onload = () => {
    let vh = window.innerHeight * 0.01
    document.body.style.setProperty('--vh', `${vh}px`)
    canvas.CreateTable()
}

window.onresize = debounce(() => {
    let vh = window.innerHeight * 0.01
    document.body.style.setProperty('--vh', `${vh}px`)
    canvas.UpdateTable()
}, 50)

document.querySelector("#generate").addEventListener("click", async () => {
    //If there is already an animation, do nothing
    if(animationController.IsInProgress()) {
        Alert(alertContainer, "Animation in progress, can't play", 'warning')
        return
    }

    //Run the algorithm and save the returned timeline
    try {
        animationController.timeline = FindPath(document.querySelector("#grid-container"))
    }
    catch(error) {
        Alert(alertContainer, error.message, 'danger')
        return
    }

    //Set cancel button before running animation to allow cancellation if anything goes wrong
    SetCancelButton()

    //Run animation
    try {
        await animateResults(animationController.timeline)
        SetResetButton()
    } catch(error) {
        Alert(alertContainer, error.message, 'danger')
    }
})

//Button hidden until the animation has finished.
document.querySelector("#reset").addEventListener("click", ()=>{
    if(animationController.IsInProgress()) {
        Alert(alertContainer, "Animation still in progress. Something went wrong.", 'danger')
    }
    ClearAnimation()
    SetGoButton()
})

document.querySelector("#cancel").addEventListener("click", () => {
    animationController.CancelTimeline()
    SetResetButton()
})

document.querySelector("#resetSettings").addEventListener("click", function () {
    animationController.CancelTimeline()
    canvas.CreateTable()
    document.querySelector("#Progress-Bar-Fill").style.width = "0%"
    SetGoButton()
})

document.querySelector("#PlayPause").addEventListener("click", function() {
    if(!animationController.IsInProgress()) {
        Alert(alertContainer, "No animation playing", 'warning')
        return
    }

    //Play or pause depending on current animation state, then toggle button state
    if(animationController.IsPlaying()) {
        animationController.Pause()
        SetPlayButton()
    }
    else {
        animationController.Play()
        SetPauseButton()
    }
})

document.querySelector("#maze").addEventListener("click", function() {
    if(animationController.IsInProgress()) {
        Alert(alertContainer, "Animation in progress", 'warning')
        return
    }

    Graph.PartitionGraph(canvas)
    DFSMaze(canvas)
})

document.querySelector("#grid-container").addEventListener('ontouchstart' in document.documentElement === true ? 'touchstart' : 'mousedown', CellHandler.bind(canvas), {passive: false})

document.querySelector("#Progress-Bar-Outline").addEventListener('mousedown', function(event) {
    if(!animationController.IsInProgress()) {
        return
    }
    //Bind the progress bar to allow the inner functions to reference it after being triggered later on
    const seekFunc = seekDrag.bind(this)
    const cleanUpFunc = cleanUp.bind(this)

    document.addEventListener("mousemove", seekFunc)
    document.addEventListener("mouseup", cleanUpFunc)

    //Pausing makes the bar less finnicky while seeking. Resumed in cleanUp()
    animationController.Pause()

    //Calling here allows for quick skipping with a click
    seekDrag.call(this, event)

    function seekDrag(event) {
        //Calculate the progress bar percentage, set the fill, then set the animation to that point
        const barFill = this.firstElementChild
        let percentage = (event.clientX-this.offsetLeft) / this.clientWidth
        if(percentage<0) {
            percentage = 0
        } else if(percentage >= 1) {
            //Percentage set to 0.99 because setting to 1 sets off the code awaiting the end
            //of the timeline which can't be undone with how it's currently set up. 
            percentage = 0.99
        }
        barFill.style.width = `${percentage}%`
        animationController.SeekTimeline(percentage)
    }

    function cleanUp(event) {
        document.removeEventListener("mousemove", seekFunc)
        document.removeEventListener("mouseup", cleanUpFunc)
        animationController.Play()
    }
})

function SetCellSize(newSize) {
    if(newSize < 10) {
        Alert(alertContainer, 'Sizes less than 10 pixels will negatively affect performance', 'warning')
        newSize = 10
    }
    PathfindingCookies.SetCellSize(newSize)
    document.querySelector("#cellSizeInput").value = newSize
    canvas.UpdateCellSize()
    canvas.UpdateTable()
}

function ChangeAlgorithm(event) {
    if(animationController.IsInProgress()) {
        animationController.CancelTimeline()
    }
    pageAlgorithm.changeAlgo(event)

    //Reset call is done after a 0ms timeout to ensure it runs AFTER all promises relating to the animation resolve.
    setTimeout(()=>{ClearAnimation(); SetGoButton()}, 0)
}

function FindPath()
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

async function animateResults() {
    try {
        let result = await animationController.PlayTimeline().then()
        return result
    }
    catch(err) {
        Alert(alertContainer, err.message, 'danger')
    }
}

function ClearAnimation() {
    canvas.ClearDOMStyles()
    for(const element of document.querySelectorAll("span[id^='pseudo']")) {
        element.style = ""
    }
    SetPauseButton()
    document.querySelector("#Progress-Bar-Fill").style.width = "0%"
}

function SetGoButton() {
    document.querySelector("#reset").style.display = "none"
    document.querySelector('#cancel').style.display = "none"
    document.querySelector("#generate").style.display = "inline"
}

function SetCancelButton() {
    document.querySelector("#reset").style.display = "none"
    document.querySelector('#cancel').style.display = "inline"
    document.querySelector("#generate").style.display = "none"
}

function SetResetButton() {
    document.querySelector("#reset").style.display = "inline"
    document.querySelector('#cancel').style.display = "none"
    document.querySelector("#generate").style.display = "none"
}

function SetPauseButton() {
    document.querySelector("#PlayPause").firstChild.setAttribute("src", "../Assets/pause-fill.svg")
}

function SetPlayButton() {
    document.querySelector("#PlayPause").firstChild.setAttribute("src", "../Assets/play-fill.svg")
}