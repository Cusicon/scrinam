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

  socket.on("createMessage", message => {
    io.emit("newMessage", {
      from: message.from,
      text: message.text,
      createdAt: new Date().getTime()
    });
    console.log("createMessage", message);
  });

  // Greet new user.
  socket.emit("newMessage", {
    from: "Admin",
    text: "Welcome to Tarotapp",
    createdAt: new Date().getTime()
  });

  // Alert others of a new user joining.
  socket.broadcast.emit("newMessage", {
    from: "Admin",
    text: "New user joined.",
    createdAt: new Date().getTime()
  });

  socket.on("disconnect", () => {
    console.log("User was disconnected");
  });
});

server.listen(port, err =>
  err ? console.log(err) : console.log(`Server started @ port: ${port}`)
);
