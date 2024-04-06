let pencil = document.querySelector(".pencil");
let eraser = document.querySelector(".eraser");
let pencilToolCont = document.querySelector('.pencil-tool-cont')
let eraserToolCont = document.querySelector('.eraser-tool-cont')
let pencilFlag = false
let eraserFlag = false
const drawingApp = {
    socket: io.connect(app_url),
    canvas: document.querySelector("canvas"),
    tool: null,
    mouseDown: false,
    penColor: "black",
    previousPenColor: "black",
    penWidth: 4,
    eraserWidth: 5,
    eraserColor: "white",
    undoRedoTracker: [],
    track: 0,
    undoLimit: 1000,
    pencilWidthElem: document.querySelector(".pencil-width"),
    eraserWidthElem: document.querySelector(".eraser-width"),
    pencilCursor: "url('https://img.icons8.com/stickers/28/pencil-tip.png') -28 28, auto",
    eraserCursor: "url('https://img.icons8.com/papercut/28/eraser.png') -28 28, auto",
    mobilePointerScale: 2,
    canvasWidth: 720,
    canvasHeight: 400,
    canvasPos: {
        x: 0,
        y: 0
    },

    init: function() {
        if (window.innerWidth > 720) {
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;
        } else {
            this.canvas.width = this.canvasWidth / this.mobilePointerScale;
            this.canvas.height = this.canvasHeight / this.mobilePointerScale;
        }
        this.tool = this.canvas.getContext("2d");
        this.setupEventListeners();
        this.setupSocketListeners();
        this.setPencilCursor();

        this.canvasPos = this.getPosition(this.canvas);

        // set initial color background
        this.updateBackgroundFromClass('.' + this.penColor + '-parent', 'white');
    },

    getPosition: function(el) {
        var xPosition = (el.offsetLeft - el.scrollLeft + el.clientLeft);
        var yPosition = (el.offsetTop - el.scrollTop + el.clientTop);
        return {
          x: xPosition,
          y: yPosition
        };
      },

    setupEventListeners: function() {
        // add mouse click event listeners for desktop devices
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

        // add touch event listeners for mobile devices
        this.canvas.addEventListener("touchstart", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("touchmove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("touchend", this.handleMouseUp.bind(this));
        document.querySelector(".undo").addEventListener("click", this.handleUndo.bind(this));
        document.querySelector(".redo").addEventListener("click", this.handleRedo.bind(this));
        document.querySelector(".download").addEventListener("click", this.handleDownload.bind(this));
        let pencilColorTiles = document.querySelectorAll(".pencil-color-tile");
        pencilColorTiles.forEach((colorElem) => {
            colorElem.addEventListener("click", () => {
                let selectedColor = colorElem.id;
                this.penColor = selectedColor;
                this.tool.strokeStyle = this.penColor;
                this.canvas.style.cursor = this.pencilCursor;
                this.updateBackgroundFromClass('.' + this.previousPenColor + '-parent', 'inherit');
                this.updateBackgroundFromClass('.' + selectedColor + '-parent', 'white');
                this.previousPenColor = selectedColor;
            });
        });

        this.pencilWidthElem.addEventListener("change", (e) => {
            this.penWidth = this.pencilWidthElem.value;
            this.tool.lineWidth = this.penWidth;
        });
        
        this.eraserWidthElem.addEventListener("change", (e) => {
            this.eraserWidth = this.eraserWidthElem.value;
            this.tool.lineWidth = this.eraserWidth;
        });
        
        eraser.addEventListener("click", () => {
            eraserFlag = !eraserFlag
            if (eraserFlag) {
                this.tool.strokeStyle = this.eraserColor;
                this.tool.lineWidth = this.eraserWidth;
                this.canvas.style.cursor = this.eraserCursor;

                // update eraser tool style
                eraserToolCont.style.display = 'flex'
                pencilToolCont.style.display = "none";
                eraser.style.backgound = "gold";
            } else {
                this.tool.strokeStyle = this.penColor;
                this.tool.lineWidth = this.penWidth;
                this.canvas.style.cursor = this.pencilCursor;
                eraserToolCont.style.display = 'none'
            }
        });

        // function to handle show/hide for pencil and eraser options on pencil click
        pencil.addEventListener('click', () => {
            pencilFlag = !pencilFlag
            if (pencilFlag) {
                pencilToolCont.style.display = "block";
                pencil.style.backgound = "gold";
                eraserToolCont.style.display = 'none'
                eraserFlag = false
                // set pencil cursor
                this.canvas.style.cursor = this.pencilCursor 
            }
            else {
                pencilToolCont.style.display = "none";
            }
        })
    },

    setupSocketListeners: function() {
        this.socket.on("beginPath", (data) => {
            // scale down the pointer location to mobile
            if (window.innerWidth <= 720) {
                data.x = data.x / this.mobilePointerScale
                data.y = data.y / this.mobilePointerScale
            }
            // only trigger socket events from different socket
            if (this.socket.id != data.sender) {
                this.beginPath(data);
            }
        });
        this.socket.on("drawStroke", (data) => {
            // scale down the pointer location to mobile
            if (window.innerWidth <= 720) {
                data.x = data.x / this.mobilePointerScale
                data.y = data.y / this.mobilePointerScale
            }
            // only trigger socket events from different socket
            if (this.socket.id != data.sender) {
                this.drawStroke(data);
            }
        });
        this.socket.on("redoUndo", (data) => {
            // only trigger socket events from different socket
            if (this.socket.id != data.sender) {
                this.undoRedoCanvas(data.source);
            }
        });
        this.socket.on("updateCanvasTracker", (data) => {
            // only trigger socket events from different socket
            if (this.socket.id != data.sender) {
                this.updateCanvasTracker(data);
            }
        });
    },

    // desktop click events have e.clientX and e.clientX co-ordinates
    // mobile touch events have e.touches[0].clientX and e.touches[0].clientX co-ordinates
    handleMouseDown: function(e) {
        this.mouseDown = true;
        var data = {
            sender: this.socket.id,
            x: e.clientX - this.canvasPos.x || e.touches[0].clientX - this.canvasPos.x,
            y: e.clientY - this.canvasPos.y || e.touches[0].clientY - this.canvasPos.y
        };
        this.beginPath(data);
        // scale up the pointer location to desktop
        if (window.innerWidth < 720) {
            data.x = data.x * this.mobilePointerScale
            data.y = data.y * this.mobilePointerScale
        }
        this.socket.emit("beginPath", data);
    },

    // desktop click events have e.clientX and e.clientX co-ordinates
    // mobile touch events have e.touches[0].clientX and e.touches[0].clientX co-ordinates
    handleMouseMove: function(e) {
        if (this.mouseDown) {
            var data = {
                sender: this.socket.id,
                x: e.clientX - this.canvasPos.x || e.touches[0].clientX - this.canvasPos.x,
                y: e.clientY - this.canvasPos.y || e.touches[0].clientY - this.canvasPos.y,
                color: eraserFlag ? this.eraserColor : this.penColor,
                width: eraserFlag ? this.eraserWidth : this.penWidth
            };
            this.drawStroke(data);
            // scale up the pointer location to desktop
            if (window.innerWidth < 720) {
                data.x = data.x * this.mobilePointerScale
                data.y = data.y * this.mobilePointerScale
            }
            this.socket.emit("drawStroke", data);
        }
    },

    handleMouseUp: function() {
        this.mouseDown = false;
        this.undoRedoTracker = this.undoRedoTracker.slice(0, this.track + 1);
        let destinationCanvas = this.getCanvasCopyWithWhiteBackground();
        let url = destinationCanvas.toDataURL();
        this.undoRedoTracker.push(url);
        if (this.undoRedoTracker.length > this.undoLimit) {
            this.undoRedoTracker = this.undoRedoTracker.slice(this.undoRedoTracker.length - this.undoLimit);
        }
        this.track = this.undoRedoTracker.length - 1;
        let updatedData = {
            sender: this.socket.id,
            updatedUndoRedoTracker: this.undoRedoTracker,
            updatedTrack: this.track
        };
        this.updateCanvasTracker(updatedData);
        this.socket.emit("updateCanvasTracker", updatedData);
    },

    clearCanvas: function (context) {
        // Store the current transformation matrix
        context.save();

        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Restore the transform
        context.restore();
    },

    handleUndo: function() {
        if (this.track > 0) {
            this.track--;
            this.undoRedoCanvas(this.undoRedoTracker[this.track]);
            let updatedData = {
                sender: this.socket.id,
                source: this.undoRedoTracker[this.track]
            };
            this.socket.emit("redoUndo", updatedData);
        } else if (this.track === 0) {
            this.track--;
            this.clearCanvas(this.tool);
        }
    },

    handleRedo: function() {
        if (this.track < (this.undoRedoTracker.length - 1)) {
            this.track++;
            this.undoRedoCanvas(this.undoRedoTracker[this.track]);
            let updatedData = {
                sender: this.socket.id,
                source: this.undoRedoTracker[this.track]
            };
            this.socket.emit("redoUndo", updatedData);
        }
    },

    handleDownload: function() {
        let canvasScreenShotWithWhiteBackground = this.getCanvasCopyWithWhiteBackground();
        let url = canvasScreenShotWithWhiteBackground.toDataURL();
        let a = document.createElement("a");
        a.href = url;
        a.download = "board-" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + ".jpg";
        a.click();
    },

    setPencilCursor: function() {
        this.canvas.style.cursor = this.pencilCursor;
    },

    updateBackgroundFromClass: function(className, color) {
        let colorElement = document.querySelector(className)
        if (colorElement) {
            colorElement.style.background = color;
        }
    },

    beginPath: function(strokeObj) {
        this.tool.beginPath();
        this.tool.moveTo(strokeObj.x, strokeObj.y);
    },

    drawStroke: function(strokeObj) {
        this.tool.strokeStyle = strokeObj.color;
        this.tool.lineWidth = strokeObj.width;
        this.tool.lineTo(strokeObj.x, strokeObj.y);
        this.tool.stroke();
    },

    undoRedoCanvas: function(image) {
        let img = new Image();
        img.src = image;
        img.onload = () => {
            this.tool.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        };
    },

    getCanvasCopyWithWhiteBackground: function() {
        let destinationCanvas = document.createElement("canvas");
        destinationCanvas.width = this.canvas.width;
        destinationCanvas.height = this.canvas.height;

        let destCtx = destinationCanvas.getContext("2d");

        destCtx.fillStyle = "#fff";
        destCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        destCtx.drawImage(this.canvas, 0, 0);

        return destinationCanvas;
    },

    updateCanvasTracker: function(updatedData) {
        this.undoRedoTracker = updatedData.updatedUndoRedoTracker;
        this.track = updatedData.updatedTrack;
    }
};

drawingApp.init();