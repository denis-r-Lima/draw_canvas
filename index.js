const socket = io.connect()

const canvas = document.querySelector("#canvas")

const context = canvas.getContext("2d")

let strokeColor = "black"
let strokeWidth = 1

canvas.width = 700
canvas.height = 500

const brush = {
  mouseDown: false,
  mouseMoving: false,
  pos: { x: 0, y: 0 },
  posA: null,
}

//Get the x and y position of the canvas to correct the mouse position
let { x, y } = canvas.getBoundingClientRect()

const colorButtons = document.querySelectorAll(".colors")

const sizeButtons = document.querySelectorAll(".size")

//Setting buttons to change color as size of the line
for (const color of colorButtons) {
  color.onclick = () => {
    strokeColor = color.id
  }
}

for (const size of sizeButtons) {
  size.onclick = () => {
    strokeWidth = size.id
  }
}

//Pressing space will erase all canvas
document.addEventListener("keypress", (key) => {
  if (key.key === " ") {
    socket.emit("erase")
  }
})

document.addEventListener("keydown", (key) => {
  if (key.ctrlKey && key.key === "z") {
    console.log("undo")
    socket.emit("undo")
  }
})

socket.on("erase", () => {
  context.clearRect(0, 0, canvas.width, canvas.height)
})

//Draw the line
const drawnLine = (line) => {
  context.beginPath()
  context.moveTo(line.posA.x, line.posA.y)
  context.lineTo(line.pos.x, line.pos.y)
  context.stroke()
}

canvas.onmousedown = () => {
  brush.mouseDown = true
}

canvas.onmouseup = () => {
  brush.mouseDown = false
}

canvas.onmouseout = () => {
  brush.mouseDown = false
}

canvas.onmousemove = (event) => {
  brush.pos = { x: event.clientX - x, y: event.clientY - y }
  brush.mouseMoving = true
}

const cycle = () => {
  if (brush.mouseDown && brush.mouseMoving && brush.posA) {
    //drawnLine({ pos: pincel.pos, posA: pincel.posA })
    socket.emit("draw", {
      pos: brush.pos,
      posA: brush.posA,
      color: strokeColor,
      width: strokeWidth,
    })
    brush.mouseMoving = false
  }
  brush.posA = { x: brush.pos.x, y: brush.pos.y }

  window.requestAnimationFrame(cycle)
}

socket.on("draw", (line) => {
  context.strokeStyle = line.color
  context.lineWidth = line.width
  drawnLine(line)
})

cycle()
