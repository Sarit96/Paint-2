const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d");

// Brush settings
let brushSize = document.getElementById("brush-size").value;
let brushColor = document.getElementById("color-picker").value;
let backgroundColor = document.getElementById("bg-color-picker").value;
let brushType = "brush"; // Default brush type

// Canvas size
canvas.width = 800;
canvas.height = 600;

// Drawing state
let isDrawing = false;
let isShapeDrawing = false;
let isEraserMode = false; // Initialize eraser mode
let shapeType = '';
let startX = 0, startY = 0;

// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// Update brush settings
const updateBrushSettings = () => {
  ctx.lineWidth = brushSize;
  ctx.strokeStyle = brushColor;
  ctx.setLineDash([]);  // Reset brush pattern
  ctx.globalAlpha = 1;
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";
};

// Brush patterns
const brushPatterns = {
  calligraphy: () => ctx.setLineDash([10, 5]),
  airbrush: () => {
    ctx.globalAlpha = 0.3;
    ctx.filter = "blur(3px)";
  },
  oil: () => {
    ctx.lineWidth = brushSize * 2;
    ctx.shadowColor = brushColor;
    ctx.shadowBlur = 10;
  },
  crayon: () => ctx.setLineDash([5, 5]),
  marker: () => {
    ctx.lineWidth = brushSize * 3;
    ctx.shadowColor = brushColor;
    ctx.shadowBlur = 10;
  },
  watercolor: () => {
    ctx.globalAlpha = 0.5;
    ctx.filter = "blur(2px)";
  },
  eraser: () => {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = brushSize * 2;
  },
};

// Event listeners for UI controls
document.getElementById("bg-color-picker").addEventListener("input", function () {
  backgroundColor = this.value;
  canvas.style.backgroundColor = backgroundColor;
});

document.getElementById("brush-size").addEventListener("input", function () {
  brushSize = this.value;
});

document.getElementById("color-picker").addEventListener("input", function () {
  brushColor = this.value;
});

// Handle brush type selection from dropdown
document.querySelectorAll(".brush-option").forEach((option) => {
  option.addEventListener("click", function () {
    brushType = this.getAttribute("data-type");
    document.getElementById("brush-dropdown-btn").innerText = this.innerText;
    document.getElementById("brush-dropdown-content").style.display = "none";
  });
});

// Handle brush dropdown button click to toggle visibility
document.getElementById("brush-dropdown-btn").addEventListener("click", function (e) {
  const content = document.getElementById("brush-dropdown-content");
  content.style.display = content.style.display === "block" ? "none" : "block";
  e.stopPropagation(); // Prevent event propagation to the document
});

// Close the dropdown if clicked outside of it
document.addEventListener("click", function (e) {
  const content = document.getElementById("brush-dropdown-content");
  const button = document.getElementById("brush-dropdown-btn");
  if (!button.contains(e.target) && !content.contains(e.target)) {
    content.style.display = "none";
    content.style.visibility = "hidden"; // Hide the dropdown properly when clicking outside
  }
});


// Drawing logic
canvas.addEventListener("mousedown", (e) => {
  if (shapeType) {
    isShapeDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
  } else {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack = [];
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isShapeDrawing) {
    ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
    const width = e.offsetX - startX;
    const height = e.offsetY - startY;

    ctx.beginPath();
    if (shapeType === "rectangle") ctx.strokeRect(startX, startY, width, height);
    else if (shapeType === "circle") {
      ctx.arc(startX, startY, Math.sqrt(width ** 2 + height ** 2), 0, Math.PI * 2);
      ctx.stroke();
    } else if (shapeType === "triangle") {
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + width, startY);
      ctx.lineTo(startX, startY + height);
      ctx.closePath();
      ctx.stroke();
    }
  } else if (isDrawing) {
    updateBrushSettings();
    if (brushPatterns[brushType]) brushPatterns[brushType]();

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    startX = e.offsetX;
    startY = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = isShapeDrawing = false;
  shapeType = '';
  ctx.beginPath();
});

// Undo/Redo functionality
document.getElementById("undo").addEventListener("click", () => {
  if (undoStack.length > 0) {
    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(undoStack.pop(), 0, 0);
  }
});

document.getElementById("redo").addEventListener("click", () => {
  if (redoStack.length > 0) {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(redoStack.pop(), 0, 0);
  }
});

// Save and clear canvas
document.getElementById("save-canvas").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL();
  link.download = "paint-app.png";
  link.click();
});

document.getElementById("clear-canvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
  redoStack = [];
});

// Shape and eraser tools
["rectangle", "circle", "triangle"].forEach((shape) => {
  document.getElementById(`draw-${shape}`).addEventListener("click", () => {
    shapeType = shape;
  });
});

document.getElementById("eraser").addEventListener("click", () => {
  const eraserBtn = document.getElementById("eraser");
  isDrawing = isEraserMode = !isEraserMode;
  eraserBtn.style.borderColor = isEraserMode ? "#e74c3c" : "#f39c12";
  eraserBtn.style.color = isEraserMode ? "#e74c3c" : "#f39c12";
  eraserBtn.style.backgroundColor = isEraserMode ? "#f8d7da" : "#f0f0f0";
  brushType = isEraserMode ? "eraser" : "brush";
});
