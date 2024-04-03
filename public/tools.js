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
    optionsContainer.innerHTML = `<svg fill="#000000" height="25px" width="25px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490 490" xml:space="preserve" stroke="#000000" stroke-width="14.7">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="40.17999999999999"></g><g id="SVGRepo_iconCarrier"> <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "></polygon></g>
                                </svg>`
    toolsContainer.style.display = 'flex'
}

// function to hide toolbar
function closeTools() {
    optionsContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 50 50">
                                    <path d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 Z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 Z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 Z"></path>
                                </svg>`
    toolsContainer.style.display = 'none'
    pencilToolCont.style.display = 'none'
    eraserToolCont.style.display = 'none'
}