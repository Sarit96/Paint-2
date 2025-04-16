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
let isEraserMode = false;
let shapeType = '';
let startX = 0, startY = 0;
let savedImageData = null; // For shape preview

// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// Reference swatch elements for displaying the chosen colors
const brushColorSwatch = document.getElementById("brush-color-swatch");
const bgColorSwatch = document.getElementById("bg-color-swatch");

// Initialize the swatches and canvas background
brushColorSwatch.style.backgroundColor = brushColor;
bgColorSwatch.style.backgroundColor = backgroundColor;
canvas.style.backgroundColor = backgroundColor;

// Update brush settings function
const updateBrushSettings = () => {
  ctx.lineWidth = brushSize;
  ctx.strokeStyle = brushColor;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);  // Reset any brush patterns
  ctx.globalAlpha = 1;
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";
};

// Brush patterns object
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

// Event listener for background color picker: update canvas bg and swatch
document.getElementById("bg-color-picker").addEventListener("input", function () {
  backgroundColor = this.value;
  canvas.style.backgroundColor = backgroundColor;
  bgColorSwatch.style.backgroundColor = backgroundColor;
});

// Event listener for brush size
document.getElementById("brush-size").addEventListener("input", function () {
  brushSize = this.value;
});

// Event listener for brush color picker: update brush color swatch
document.getElementById("color-picker").addEventListener("input", function () {
  brushColor = this.value;
  brushColorSwatch.style.backgroundColor = brushColor;
});

// Handle brush type selection from dropdown
document.querySelectorAll(".brush-option").forEach((option) => {
  option.addEventListener("click", function () {
    brushType = this.getAttribute("data-type");
    document.getElementById("brush-dropdown-btn").innerText = this.innerText;
    const dropdownContent = document.getElementById("brush-dropdown-content");
    dropdownContent.style.display = "none";
    dropdownContent.style.visibility = "hidden";
  });
});

// Toggle brush dropdown visibility
document.getElementById("brush-dropdown-btn").addEventListener("click", function (e) {
  const content = document.getElementById("brush-dropdown-content");
  if (content.style.display === "block") {
    content.style.display = "none";
    content.style.visibility = "hidden";
  } else {
    content.style.display = "block";
    content.style.visibility = "visible";
  }
  e.stopPropagation();
});
document.addEventListener("click", function (e) {
  const content = document.getElementById("brush-dropdown-content");
  const button = document.getElementById("brush-dropdown-btn");
  if (!button.contains(e.target) && !content.contains(e.target)) {
    content.style.display = "none";
    content.style.visibility = "hidden";
  }
});

// Canvas drawing events
canvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  
  // Save state for undo and shape preview
  if (!shapeType) {
    isDrawing = true;
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack = [];
  } else {
    isShapeDrawing = true;
    savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isShapeDrawing) {
    // Clear previous preview and restore saved image
    ctx.putImageData(savedImageData, 0, 0);
    const width = e.offsetX - startX;
    const height = e.offsetY - startY;
    
    ctx.beginPath();
    updateBrushSettings();
    // Use the chosen brush pattern if any
    if (brushPatterns[brushType]) brushPatterns[brushType]();

    if (shapeType === "rectangle") {
      ctx.strokeRect(startX, startY, width, height);
    } else if (shapeType === "circle") {
      const radius = Math.sqrt(width ** 2 + height ** 2);
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
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

canvas.addEventListener("mouseup", (e) => {
  if (isShapeDrawing) {
    // Commit the drawn shape by pushing the new state to undo
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    isShapeDrawing = false;
    shapeType = '';
  } else if (isDrawing) {
    isDrawing = false;
  }
  ctx.beginPath();
});

// Undo and redo functionality
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

// Shape tool buttons
["rectangle", "circle", "triangle"].forEach((shape) => {
  document.getElementById(`draw-${shape}`).addEventListener("click", () => {
    shapeType = shape;
  });
});

// Eraser tool: Toggle eraser mode and update icon (using the "selected" class)
document.getElementById("eraser").addEventListener("click", () => {
  const eraserBtn = document.getElementById("eraser");
  if (eraserBtn.classList.contains("selected")) {
    // Eraser deselected: switch back to brush mode
    eraserBtn.classList.remove("selected");
    isDrawing = isEraserMode = false;
    brushType = "brush";
  } else {
    // Eraser selected: enable eraser mode
    eraserBtn.classList.add("selected");
    isDrawing = isEraserMode = true;
    brushType = "eraser";
  }
});
