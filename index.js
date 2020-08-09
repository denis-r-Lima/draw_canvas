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

let { x, y } = canvas.getBoundingClientRect()

const colorButtons = document.querySelectorAll(".colors")

const sizeButtons = document.querySelectorAll(".size")

//Setting buttons to change color and size of the line
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

//Get the input an perform action
let actions = {
  keydown: (event) => {
    if (event.key === " ") {
      socket.emit("erase")
    }
    if (event.ctrlKey && event.key === "z") {
      socket.emit("undo")
    }
  },
  mousedown: (event) => {
    brush.mouseDown = true
  },
  mouseup: (event) => {
    brush.mouseDown = false
  },
  mousemove: (event) => {
    brush.pos = { x: event.clientX - x, y: event.clientY - y }
    brush.mouseMoving = true
  },
  mouseout: (event) => {
    brush.mouseDown = false
  },
}

//Handle all user inputs
const handleInput = (event) => {
  actions[event.type](event)
}

document.addEventListener("keydown", handleInput)

canvas.addEventListener("mousedown", handleInput)

canvas.addEventListener("mouseup", handleInput)

canvas.addEventListener("mousemove", handleInput)

canvas.addEventListener("mouseout", handleInput)

//Draw on the canvas
const drawnLine = (line) => {
  context.beginPath()
  context.moveTo(line.posA.x, line.posA.y)
  context.lineTo(line.pos.x, line.pos.y)
  context.stroke()
}

const cycle = () => {
  if (brush.mouseDown && brush.mouseMoving && brush.posA) {
    socket.emit("draw", {
      pos: brush.pos,
      posA: brush.posA,
      color: strokeColor,
      width: strokeWidth,
    })
    brush.mouseMoving = false
  }
  brush.posA = { x: brush.pos.x, y: brush.pos.y }

  requestAnimationFrame(cycle)
}

cycle()

socket.on("erase", () => {
  context.clearRect(0, 0, canvas.width, canvas.height)
})

socket.on("draw", (line) => {
  context.strokeStyle = line.color
  context.lineWidth = line.width
  drawnLine(line)
})
