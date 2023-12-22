import Cookies from "./js.cookie.min.mjs"

let fontChange_px = 0
let dark = false

/// SETTINGS ----------------------------------------------------------------------------------
function darkMode() {   // enables dark mode
    //If there's a mismatch between cookie and current mode: Match the cookie.
    if(Cookies.get('darkMode') == '1' && dark == false) {
        Cookies.set('darkMode', '1', {expires: 999, sameSite: 'strict'})
    }
    else if(Cookies.get('darkMode') == '1') {
        Cookies.set('darkMode', '0', {expires: 999, sameSite: 'strict'})
    }
    else {
        Cookies.set('darkMode', '1', {expires: 999, sameSite: 'strict'})
    }

    var darkSwitch = document.querySelector("#darkModeSwitch")
    var settingModal = document.getElementById("settingModalDialog")
    var back = document.body
    var algoCard = document.querySelectorAll(".card-algorithm-type")
    var btnOutline = [].concat(...document.querySelectorAll(".btnResize"))
    .concat(document.querySelector(".btn-left"))
    .concat(document.querySelector(".btn-right"))
    .filter(e=>e)
    var introModal = document.querySelector("#introModal")
    var grid = document.querySelector("#grid-container")
    var draggable = document.querySelectorAll(".draggable")
    var arrBar = document.querySelectorAll(".arrBar")
    var inputTab = document.querySelector(".input-tab")
    var customInput = document.querySelector(".customInputs")
    var footerVals = document.querySelectorAll(".barFooter")

    settingModal.classList.toggle("modal-setting-dark")    // settings
    back.classList.toggle("back-dark")                    // background
    algoCard.forEach(element => {
        element.classList.toggle("card-algorithm-type-dark")
    })
    btnOutline.forEach(element => {
        element.classList.toggle("light-outline")
    })
    if(introModal) {    // 
        introModal.classList.toggle("introModal-dark")
    }
    //if(grid) {
    //    grid.classList.toggle("grid-dark") // grid
    //}
    if(draggable) {
        draggable.forEach(element => {
            element.classList.toggle("draggable-dark")
        })
    }
    if(arrBar) {
        arrBar.forEach(element => {
            element.classList.toggle("arrBar-dark")
        })
    }
    if(inputTab) {
        inputTab.classList.toggle("input-tab-dark")
        customInput.classList.toggle("customInputs-dark")
    }
    if(footerVals) {
        footerVals.forEach(e => e.classList.toggle("barFooter-dark"))
    }

    dark = !dark
}

function increaseFontSize() {
    if(fontChange_px < 3) {
        var text = document.querySelectorAll('.text');

        for (let i = 0; i < text.length; i++) {
            var style = window.getComputedStyle(text[i]).getPropertyValue('font-size');
            var currentSize = parseFloat(style);
            text[i].style.fontSize = (currentSize + 1) + 'px';  // current size + 1 px        
        }
        
        fontChange_px++
    }
}

function decreaseFontSize() {
    if(fontChange_px > -3) {
       var text = document.querySelectorAll('.text'); 

        for(var i = 0; i < text.length; i++) {
            var style = window.getComputedStyle(text[i]).getPropertyValue('font-size');
            var currentSize = parseFloat(style);
            text[i].style.fontSize = (currentSize - 1) + 'px';  // current size + 1 px
            
        }
        fontChange_px-- 
    }
    
}

function resetSettings() {
    var text = document.querySelectorAll('.text');
    if (fontChange_px > 0) {
        for (let i = 0; i < text.length; i++) {
            var style = window.getComputedStyle(text[i]).getPropertyValue('font-size');
            var currentSize = parseFloat(style);
            text[i].style.fontSize = (currentSize - fontChange_px) + 'px';   // subtracts px by how many times it increased
        }
        
    } else if(fontChange_px < 0) {
        for (let i = 0; i < text.length; i++) {
            var style = window.getComputedStyle(text[i]).getPropertyValue('font-size');
            var currentSize = parseFloat(style);
            text[i].style.fontSize = (currentSize - fontChange_px) + 'px';   // subtracts px by how many times it increased
        }
    }
    fontChange_px = 0

    if(dark) {
        document.querySelector("#darkModeSwitch").click()
    }
}

/// MAIN MENU ----------------------------------------------------------------------------------
function menuChange() {
    let menuBtn = document.querySelectorAll(".menu-button")
    menuBtn.forEach(element => {
        element.toggleAttribute('disabled')
    })

    setTimeout(function(){
        menuBtn.forEach(element => {
            element.toggleAttribute('disabled')
        })
    },600)
}

function sortingGo() {    // animation if sorting go is selected
    menuChange()
    $('#algorithmsMenu').fadeTo(500, 0, function() {
        document.querySelector('#algorithmsMenu').style.visibility = 'hidden';
    });

    document.querySelector('#sortingMenu').style.visibility = 'visible';

    $('#sortingMenu').fadeTo(500, 1);
}

function sortingBack() { // animation if sorting back button is selected
    menuChange()
    $('#sortingMenu').fadeTo(500, 0, function() {
        document.querySelector('#sortingMenu').style.visibility = 'hidden';
    });

    document.querySelector('#algorithmsMenu').style.visibility = 'visible';
    
    $('#algorithmsMenu').fadeTo(500, 1);
}

function searchingGo() {    // animation if sorting go is selected
    menuChange()
    $('#algorithmsMenu').fadeTo(500, 0, function() {
        document.querySelector('#algorithmsMenu').style.visibility = 'hidden';
    });

    document.querySelector('#searchingMenu').style.visibility = 'visible';

    $('#searchingMenu').fadeTo(500, 1);
}

function searchingBack() { // animation if sorting back button is selected
    menuChange()
    $('#searchingMenu').fadeTo(500, 0, function() {
        document.querySelector('#searchingMenu').style.visibility = 'hidden';
    });

    document.querySelector('#algorithmsMenu').style.visibility = 'visible';

    $('#algorithmsMenu').fadeTo(500, 1);
}

function pathfindingGo() {    // animation if sorting go is selected
    menuChange()
    $('#algorithmsMenu').fadeTo(500, 0, function() {
        document.querySelector('#algorithmsMenu').style.visibility = 'hidden';
    });

    document.querySelector('#pathfindingMenu').style.visibility = 'visible';

    $('#pathfindingMenu').fadeTo(500, 1);
}

function pathfindingBack() { // animation if sorting back button is selected
    menuChange()
    $('#pathfindingMenu').fadeTo(500, 0, function() {
        document.querySelector('#pathfindingMenu').style.visibility = 'hidden';
    });

    document.querySelector('#algorithmsMenu').style.visibility = 'visible';

    $('#algorithmsMenu').fadeTo(500, 1);
}

window.addEventListener('load', function() {
    if(!Cookies.get('darkMode')) { //If no cookie, default to light mode
        Cookies.set('darkMode', '0', {expires: 999, sameSite: 'strict'})
    }
    else if(Cookies.get('darkMode') === '1') { //Cookie says dark mode
        document.querySelector("#darkModeSwitch").toggleAttribute('checked')
        darkMode()
    }
})

document.querySelector("#fontIncrease")?.addEventListener('click', increaseFontSize)
document.querySelector("#fontDecrease")?.addEventListener('click', decreaseFontSize)
document.querySelector("#darkModeSwitch")?.addEventListener('click', darkMode)
document.querySelector("#resetSettings")?.addEventListener('click', resetSettings)
document.querySelector("#sortingGo")?.addEventListener('click', sortingGo)
document.querySelector("#searchingGo")?.addEventListener('click', searchingGo)
document.querySelector("#pathfindingGo")?.addEventListener('click', pathfindingGo)
document.querySelector("#sortingBack")?.addEventListener('click', sortingBack)
document.querySelector("#searchingBack")?.addEventListener('click', searchingBack)
document.querySelector("#pathfindingBack")?.addEventListener('click', pathfindingBack)
