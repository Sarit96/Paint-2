const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d");

// Brush settings
let brushSize = document.getElementById("brush-size").value;
let brushColor = document.getElementById("color-picker").value;
let backgroundColor = document.getElementById("bg-color-picker").value;
let brushType = "brush"; // Default brush type

// Set initial canvas size
canvas.width = 800;
canvas.height = 600;

// Variables for drawing
let isDrawing = false;
let startX = 0;
let startY = 0;

// Set the background color
document
  .getElementById("bg-color-picker")
  .addEventListener("input", function () {
    backgroundColor = this.value;
    canvas.style.backgroundColor = backgroundColor;
  });

// Handle brush size change
document.getElementById("brush-size").addEventListener("input", function () {
  brushSize = this.value;
});

// Handle brush color change
document.getElementById("color-picker").addEventListener("input", function () {
  brushColor = this.value;
});

// Handle brush type change (dropdown for different brushes)
document.querySelectorAll(".brush-option").forEach((option) => {
  option.addEventListener("click", function () {
    brushType = this.getAttribute("data-type");
    document.getElementById("brush-dropdown-btn").innerText = this.innerText; // Change button text to the selected brush type
    document.getElementById("brush-dropdown-content").style.display = "none"; // Close the dropdown
  });
});

// Toggle dropdown visibility
document
  .getElementById("brush-dropdown-btn")
  .addEventListener("click", function () {
    const content = document.getElementById("brush-dropdown-content");
    content.style.display =
      content.style.display === "block" ? "none" : "block";
  });

// Brush Pattern Functions

// Calligraphy brush (tapered line)
function calligraphyBrush() {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.setLineDash([10, 5]);
}

// Airbrush (soft, diffused strokes)
function airbrush() {
  ctx.globalAlpha = 0.3; // Lower opacity for diffused effect
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.filter = "blur(3px)"; // Apply blur effect
}

// Oil brush (rough, thicker strokes)
function oilBrush() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = brushSize * 2; // Thicker strokes
  ctx.shadowColor = brushColor;
  ctx.shadowBlur = 10; // Add shadow effect for texture
}

// Crayon (rough, fuzzy strokes)
function crayonBrush() {
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.lineWidth = brushSize;
  ctx.globalCompositeOperation = "source-over";
  ctx.setLineDash([5, 5]); // Fuzzy line
}

// Marker brush (bold strokes)
function markerBrush() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = brushSize * 3; // Thicker, bolder strokes
  ctx.shadowColor = brushColor;
  ctx.shadowBlur = 10; // Add shadow to simulate a marker effect
}

// Watercolor brush (soft blended strokes)
function watercolorBrush() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.5; // Soft, blended effect
  ctx.filter = "blur(2px)";
}

// Drawing on the canvas
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  ctx.lineWidth = brushSize;
  ctx.strokeStyle = brushColor;

  // Apply the selected brush type
  switch (brushType) {
    case "calligraphy":
      calligraphyBrush();
      break;
    case "airbrush":
      airbrush();
      break;
    case "oil":
      oilBrush();
      break;
    case "crayon":
      crayonBrush();
      break;
    case "marker":
      markerBrush();
      break;
    case "watercolor":
      watercolorBrush();
      break;
    default:
      ctx.setLineDash([]); // Regular brush
      break;
  }

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  ctx.beginPath();
});

// Undo functionality
let undoStack = [];
let redoStack = [];

document.getElementById("undo").addEventListener("click", () => {
  if (undoStack.length > 0) {
    const imageData = undoStack.pop();
    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); // Save current state to redo stack
    ctx.putImageData(imageData, 0, 0);
  }
});

// Redo functionality
document.getElementById("redo").addEventListener("click", () => {
  if (redoStack.length > 0) {
    const imageData = redoStack.pop();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); // Save current state to undo stack
    ctx.putImageData(imageData, 0, 0);
  }
});

// Save functionality
document.getElementById("save-canvas").addEventListener("click", () => {
  const imageUrl = canvas.toDataURL();
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = "paint-app.png";
  link.click();
});

// Clear canvas functionality
document.getElementById("clear-canvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
  redoStack = [];
});
