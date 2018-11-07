const canvas = document.querySelector("#draw");

// console.log("I am linked!");

const ctx = canvas.getContext("2d");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

var signature = "";

ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.lineWidth = 10;
ctx.strokeStyle = "#ac0000";

let isDrawing = false;
let lastX = 0;
let lastY = 0;

function draw(e) {
    if (!isDrawing) return;
    console.log(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

canvas.addEventListener("mousedown", e => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    signature = canvas.toDataURL();
    console.log(signature);
});
canvas.addEventListener("mouseout", () => {
    isDrawing = false;
    signature = canvas.toDataURL();
});
