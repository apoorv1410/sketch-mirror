let socket = io.connect("http://localhost:" + (process.env.PORT || 5500));

let canvas = document.querySelector("canvas");
// set canvas size as full window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let pencilCursor = "url('https://img.icons8.com/stickers/28/pencil-tip.png') -28 28, auto"
let eraserCursor = "url('https://img.icons8.com/papercut/28/eraser.png'), auto"
canvas.style.cursor = pencilCursor 

let pencilColorTiles = document.querySelectorAll(".pencil-color-tile");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "black";
let previousPenColor = "black";
// initialize background color for pen color
updateBackgroundFromClass('.' + penColor + '-parent', 'white')

const eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = []; //Data
let track = 0; // index of latest canvas in undoRedoTracker

let mouseDown = false;

// API to perform graphic
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// mousedown -> start new path
canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    var data = {
        x: e.clientX,
        y: e.clientY
    }
    // send data to server
    socket.emit("beginPath", data);
})
// mousemove -> path fill (graphics)
canvas.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        var data = {
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag ? eraserColor : penColor,
            width: eraserFlag ? eraserWidth : penWidth
        }
        drawStroke(data)
        socket.emit("drawStroke", data);
    }
})
// set the undo history limit to constrol the updatedUndoRedoTracker array size
let undoLimit = 1000
canvas.addEventListener("mouseup", () => {
    mouseDown = false;
    undoRedoTracker = undoRedoTracker.slice(0, track+1)
    
    let destinationCanvas = getCanvasCopyWithWhiteBackground(canvas);
    let url = destinationCanvas.toDataURL();
    undoRedoTracker.push(url);

    if (undoRedoTracker.length > undoLimit) {
        undoRedoTracker = undoRedoTracker.slice(undoRedoTracker.length - undoLimit)
    }
    track = undoRedoTracker.length - 1
    let updatedData = {
        updatedUndoRedoTracker: undoRedoTracker,
        updatedTrack: track
    }
    updateCanvasTracker(updatedData)
    socket.emit("updateCanvasTracker", updatedData);
})

function updateCanvasTracker (updatedData) {
    undoRedoTracker = updatedData.updatedUndoRedoTracker
    track = updatedData.updatedTrack
}

undo.addEventListener("click", () => {
    if (track > 0) {
        track--;
        undoRedoCanvas(undoRedoTracker[track])
        socket.emit("redoUndo", undoRedoTracker[track]);
    } else if (track === 0) {
        track--;
        clearCanvas(tool)
    }
})
redo.addEventListener("click", () => {
    if (track < (undoRedoTracker.length - 1)) {
        track++;
        undoRedoCanvas(undoRedoTracker[track])
        socket.emit("redoUndo", undoRedoTracker[track]);
    }
})

function undoRedoCanvas(image) {
    let img = new Image(); // new image reference element
    img.src = image;
    img.onload = () => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function clearCanvas (context) {
        // Store the current transformation matrix
    context.save();

    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the transform
    context.restore();
}

// start new graphic and new start point
function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}

// draw path to destination position with selected style
function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

function getCanvasCopyWithWhiteBackground () {
    // create temporary canvas element
    let destinationCanvas = document.createElement("canvas");
    destinationCanvas.width = canvas.width;
    destinationCanvas.height = canvas.height;

    let destCtx = destinationCanvas.getContext("2d");

    //create a rectangle with the desired color
    destCtx.fillStyle = "#fff";
    destCtx.fillRect(0,0,canvas.width,canvas.height);

    //draw the original canvas onto the destination canvas
    destCtx.drawImage(canvas, 0, 0);

    //finally use the destinationCanvas.toDataURL() method to get the desired output;
    return destinationCanvas;
}

pencilColorTiles.forEach((colorElem) => {
    colorElem.addEventListener("click", () => {
        let selectedColor = colorElem.id;
        penColor = selectedColor;
        tool.strokeStyle = penColor;
        canvas.style.cursor = pencilCursor
        
        // remove background from previous pen color
        updateBackgroundFromClass('.' + previousPenColor + '-parent', 'inherit')

        // add background to selected pen color
        updateBackgroundFromClass('.' + selectedColor + '-parent', 'white')

        // update previous pen color
        previousPenColor = selectedColor
    })
})

function updateBackgroundFromClass (className, color) {
    let colorElement = document.querySelector(className)
    if (colorElement) {
        colorElement.style.background = color;
    }
}

// reset selected color background

pencilWidthElem.addEventListener("change", (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})
eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})
eraser.addEventListener("click", () => {
    if (eraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
        // set eraser cursor
        canvas.style.cursor = eraserCursor 
    } else {
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
        // set pencil cursor
        canvas.style.cursor = pencilCursor 
    }
})

download.addEventListener("click", () => {
    let canvasScreenShotWithWhiteBackground = getCanvasCopyWithWhiteBackground(canvas)
    url = canvasScreenShotWithWhiteBackground.toDataURL();

    let a = document.createElement("a");
    a.href = url;
    a.download = "board-" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() +".jpg";
    a.click();
})


socket.on("beginPath", (data) => {
    // data -> data from server
    beginPath(data);
})
socket.on("drawStroke", (data) => {
    drawStroke(data);
})
socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})
socket.on("updateCanvasTracker", (data) => {
    updateCanvasTracker(data);
})