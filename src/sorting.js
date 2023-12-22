import { dragElement, ResizeHandler } from "./draggableCard.js"
import { Alert } from "./Alert.js"
import { CheckFirstVisit } from "./Cookies.js"
import { PageAlgorithm, DisplayAnnotation } from "./SetAlgorithm.js";
import { AnimationController } from "./AnimationController.js";
import { Input } from "./Input.js";
import { debounce } from "./Utility.js";
import SortingCanvas from "./SortingCanvas.js"

CheckFirstVisit('sortVisited')

const alertContainer = document.getElementById('alertContainer')
const pageAlgorithm = new PageAlgorithm()
const animationController = new AnimationController()
const InputManager = Input.GetInstance()
InputManager.SetInput([32, 24, 10, 22, 18, 40, 4, 43, 2, 25]) //Initial dummy input
//Planned redesign, but currently unused as current method is performant enough using realistic array sizes
const Canvas = new SortingCanvas({canvasElement: document.querySelector("#arrCanvas"), input: InputManager.input})

//Bar sizing is only done on creation, so if the window gets resized, the bars need to be recreated to adapt
window.onload = generateBars
window.onresize = debounce(()=>{generateBars()}, 50)

//Initialize dropdown menu buttons. Uses SelectorAll so as to grab the mobile menu buttons as well.
document.querySelectorAll(".InsertionSort").forEach((element) => {element.onclick=ChangeAlgorithm})
document.querySelectorAll(".SelectionSort").forEach((element) => {element.onclick=ChangeAlgorithm})
document.querySelectorAll(".BubbleSort").forEach((element) => {element.onclick=ChangeAlgorithm})
document.querySelectorAll(".QuickSort").forEach((element) => {element.onclick=ChangeAlgorithm})

//Callback passed to dropdown buttons, so it takes an event.
function ChangeAlgorithm(event) {
    if(animationController.IsInProgress()) {
        animationController.CancelTimeline()
    }
    pageAlgorithm.changeAlgo(event)

    //Reset call is done after a 0ms timeout to ensure it runs AFTER all promises relating to the animation resolve.
    setTimeout(()=>{Reset()}, 0)
}

pageAlgorithm.changeAlgo((new URLSearchParams(window.location.search)).get("func") || "insertionsort")


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function randomInput() {
    let input = []
    let inputString
    let length = getRandomIntInclusive(5, 20)
    
    for (let i = 0; i < length; i++) {
        input.push(getRandomIntInclusive(1, 100))
    }

    InputManager.SetInput(input)
    //document.querySelector("#input").value = inputString
    document.querySelector("#reset").style.display = "none"
    document.querySelector("#start").style.display = "inline"
    
    generateBars()
}

//Creates the canvas. Called on load and resize. Does not modify state.
//Just reads the current user input and creates HTML from it.
function generateBars() {
    const input = InputManager.GetInput()
    removeBars()

    const container = document.querySelector('#arrCanvas')
    container.style.setProperty("--columns", input.length)
    const width = container.getBoundingClientRect().width / input.length
    container.style.setProperty("--width", width)
    container.style.setProperty("--widthCSS", `${width}px`)
    
    //Used to calculate each bar's height as a percentage of the tallest bar.
    const max = Math.max(...input.map(o => o.value))
    const maxHeight = container.offsetHeight

    for(let i = 0; i < input.length; i++) {
        const barContainer = document.createElement('div')
        const arrBar = document.createElement('div')
        const numberDiv = document.createElement('div')

        //Build the container for each bar
        barContainer.setAttribute('id', `arrBar${i}`)
        barContainer.style.setProperty("display", "flex")
        barContainer.style.setProperty("flex-direction", "column")
        barContainer.style.setProperty("justify-content", "flex-end")
        barContainer.style.setProperty('--position', `${i * document.querySelector('#arrCanvas').getBoundingClientRect().width / input.length}`)
        barContainer.style.setProperty('--translation', 0)
        //barContainer.style.height = (maxHeight * (input[i].value / max)) + 'px'
        barContainer.style.height = "100%"
        //Build the bar itself, deciding dimensions and color
        arrBar.classList.add('arrBar')
        
        //Bar footer height is set to 10% in the CSS, have the bar take up some percentage
        //of the remaining 90%
        arrBar.style.height = `${(input[i].value / max) * 90}%`
        arrBar.addEventListener("click", ()=>{DeleteBar(input[i])})
        arrBar.style.margin = width > 30 ? "0px 1.5px" : "0px 0px"

        numberDiv.classList.add('barFooter')
        if((Cookies.get('darkMode') === '1')) {  // if dark mode and arrBar does not have dark, add dark
            numberDiv.classList.add('barFooter-dark')
        }

        const value = document.createElement('p')
        value.style.display = "inline"
        value.innerHTML = input[i].value
        numberDiv.appendChild(value)
        
        barContainer.appendChild(arrBar)
        barContainer.appendChild(numberDiv)
        container.appendChild(barContainer)
    }
}

// removes existing bars
function removeBars() { 
    //var bars = document.querySelectorAll('.arrBar')
    //bars.forEach(element => element.remove())
    document.querySelector("#arrCanvas").innerHTML = ''
}

//Entrypoint for animation - executes the algorithm and starts the animation
async function start() {
    if(animationController.IsInProgress()) {
        Alert(alertContainer, "Animation in progress, can't play", 'warning')
        return
    }

    //Change Go to Cancel 
    SetCancelButton()

    animationController.timeline = Sort()

    try {
        await swapAnimation(animationController.timeline)
        SetResetButton()
    } catch(error) {
        Alert(alertContainer, 'Error at swapAnimation: ' + error.message, 'danger')
    }
}
//Take input and run current algorithm
function Sort() {
    const timeline = pageAlgorithm.selectedFunction(InputManager.GetInput(), 0, InputManager.GetInput().length - 1)
    return timeline
}
//Take results and run animation
async function swapAnimation() {
    try {
        let result = await animationController.PlayTimeline().then()
        return result
    } catch(error) {
        Alert(alertContainer, error.message, 'danger')
    }
}

function Reset() {
    if(animationController.IsInProgress()) Alert(alertContainer, "Animation still in progress. Something went wrong.", 'danger')
    generateBars()
    ClearAnimation()
    SetGoButton()
}

function SetInputFromText(textInput) {
    let values = textInput.split(',')
    values = values.map((e)=>Number(e)).filter((e)=>e)
    InputManager.SetInput(values)
    generateBars()
}

// Initialize Draggable cards
document.querySelectorAll(".draggable").forEach((element) => {dragElement(element)})
document.querySelectorAll(".resizer").forEach((element) => {ResizeHandler(element)})

//Initialize playbar bar elements
document.querySelector('#start').addEventListener('click', start)
document.querySelector("#AnimSpeed").addEventListener("click", function() {
    animationController.SetSpeed(animationController.speeds[(animationController.speeds.indexOf(animationController.speed)+1)%animationController.speeds.length])
    this.innerHTML = `${animationController.speed}x`
})
document.querySelector("#reset").addEventListener("click", Reset)
document.querySelector("#cancel").addEventListener("click", () => {
    animationController.CancelTimeline()
    SetResetButton()
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
document.querySelector("#Progress-Bar-Outline").addEventListener('mousedown', function(event) {
    if(!animationController.IsInProgress()) {
        return
    }
    //Bind the progress bar to allow the inner functions to reference it after being triggered later on
    const seekFunc = seekDrag.bind(this)
    const cleanUpFunc = cleanUp.bind(this)

    //Tracked in order remain in correct state after mouse release
    const paused = animationController.IsPlaying()

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
            percentage = 0.99
        }
        barFill.style.width = `${percentage}%`
        animationController.SeekTimeline(percentage)
    }

    function cleanUp(event) {
        document.removeEventListener("mousemove", seekFunc)
        document.removeEventListener("mouseup", cleanUpFunc)
        if(paused) animationController.Play()
    }
})

//Input sidebar elements
document.querySelector("#randomNumbers").addEventListener('click', randomInput)
document.querySelector('#getNewInput').addEventListener('click', function() {
    SetInputFromText(document.querySelector('#input').value)
    try {
    generateBars()
    }
    catch(error) {
        Alert(alertContainer, error.message, 'danger')
    }
})
document.querySelector('#input').addEventListener('change', function(){SetInputFromText(this.value)})
// ----------------------------------------------------------------

//Helper functions that assist in syncing page with state
function SetGoButton() {
    document.querySelector("#reset").style.display = "none"
    document.querySelector('#cancel').style.display = "none"
    document.querySelector("#start").style.display = "inline"
}

function SetCancelButton() {
    document.querySelector("#reset").style.display = "none"
    document.querySelector('#cancel').style.display = "inline"
    document.querySelector("#start").style.display = "none"
}

function SetResetButton() {
    document.querySelector("#reset").style.display = "inline"
    document.querySelector('#cancel').style.display = "none"
    document.querySelector("#start").style.display = "none"
}

function SetPauseButton() {
    document.querySelector("#PlayPause").firstChild.setAttribute("src", "../Assets/pause-fill.svg")
}

function SetPlayButton() {
    document.querySelector("#PlayPause").firstChild.setAttribute("src", "../Assets/play-fill.svg")
}

function ClearAnimation() {
    for(const element of document.querySelectorAll("span[id^='pseudo']")) {
        element.style = ""
    }
    SetPauseButton()
    document.querySelector("#Progress-Bar-Fill").style.width = "0%"
}

function DeleteBar(barObj) {
    if(animationController.IsInProgress()) {
        Alert(alertContainer, "Animation currently playing", 'warning')
        return
    }


    document.querySelector(`${barObj.id}`).remove()
    InputManager.RemoveNumber(barObj.id)
    Alert(alertContainer, `Removed ${barObj.value}`, 'success', 2500)
    SetInputFromText(document.querySelector('#input').value)
    generateBars()
}