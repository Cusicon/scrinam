const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const path = require("path");

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3030;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on("connection", socket => {
  console.log("New user connected.");

  socket.on("disconnect", () => {
    console.log("User was disconnected");
  });
});

server.listen(port, err =>
  err ? console.log(err) : console.log(`Server started @ port: ${port}`)
);
