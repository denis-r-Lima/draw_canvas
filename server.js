const express = require("express")
const socketIO = require("socket.io")

let lines = []

const app = express()

const server = app.listen(3000, () => {
  console.log("server running!")
})

app.use(express.static(__dirname))

const io = socketIO.listen(server)

io.on("connection", (socket) => {
  console.log("New connection detected")
  lines.map((line) => {
    return socket.emit("draw", line)
  })

  socket.on("draw", (msg) => {
    io.emit("draw", msg)
    lines.push(msg)
  })
  socket.on("erase", () => {
    io.emit("erase")
    lines = []
  })
})
