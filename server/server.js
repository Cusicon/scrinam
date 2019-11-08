const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const { generateMessage, generateLocationMessage } = require("./utils/message");

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3030;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

// Init socket connection
io.on("connection", socket => {
  console.log("New user connected.");

  // Greet new user.
  socket.emit("newMessage", generateMessage("Admin", "Welcome to Tarotapp"));

  // Alert others of a new user joining.
  socket.broadcast.emit(
    "newMessage",
    generateMessage("Admin", "New user joined.")
  );

  // Receiving and sending messages to users
  socket.on("createMessage", (message, callback) => {
    console.log("createMessage", message);
    io.emit("newMessage", generateMessage(message.from, message.text));
  });

  socket.on("createLocationMessage", (coords, callback) => {
    io.emit(
      "newLocationMessage",
      generateLocationMessage("User", coords.latitude, coords.longitude)
    );
  });

  // Disconnect socket
  socket.on("disconnect", () => {
    console.log("User was disconnected");
  });
});

server.listen(port, err =>
  err ? console.log(err) : console.log(`Server started @ port: ${port}`)
);
