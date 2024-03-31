let toolsContainer = document.querySelector('.tools-cont')
let optionsContainer = document.querySelector('.options-cont')
let pencil = document.querySelector(".pencil");
let eraser = document.querySelector(".eraser");
let pencilToolCont = document.querySelector('.pencil-tool-cont')
let eraserToolCont = document.querySelector('.eraser-tool-cont')
let optionsFlag = true
let pencilFlag = false
let eraserFlag = false
// show tools > true flag
optionsContainer.addEventListener('click', () => {
    optionsFlag = !optionsFlag

    if (optionsFlag) {
        openTools()
    } else {
        closeTools()
    }
})

// function to show toolbar
function openTools() {
    let iconEl = optionsContainer.children[0];
    iconEl.classList.remove('fa-bars')
    iconEl.classList.add('fa-times')

    toolsContainer.style.display = 'flex'
}

// function to hide toolbar
function closeTools() {
    let iconEl = optionsContainer.children[0];
    iconEl.classList.remove('fa-times')
    iconEl.classList.add('fa-bars')
    toolsContainer.style.display = 'none'
    pencilToolCont.style.display = 'none'
    eraserToolCont.style.display = 'none'
}

// function to handle show/hide for pencil and eraser options on pencil click
pencil.addEventListener('click', () => {
    pencilFlag = !pencilFlag
    if (pencilFlag) {
        pencilToolCont.style.display = "block";
        pencil.style.backgound = "gold";
        eraserToolCont.style.display = 'none'
        eraserFlag = false
        // set pencil cursor
        canvas.style.cursor = pencilCursor 
    }
    else {
        pencilToolCont.style.display = "none";
    }
})

// function to handle show/hide for pencil and eraser options on eraser click
eraser.addEventListener('click', () => {
    eraserFlag = !eraserFlag
    if (eraserFlag) {
        eraserToolCont.style.display = 'flex'
        pencilToolCont.style.display = "none";
        eraser.style.backgound = "gold";
    } else {
        eraserToolCont.style.display = 'none'
    }
})