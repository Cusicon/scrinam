const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3030;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));

// Init socket connection
io.on("connection", socket => {
  console.log("New user connected.");

  // Join room
  socket.on("join", (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback("Name and room are required.");
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
    io.to(params.room).emit("updateUserList", users.getUserList(params.room));

    // Greet new user.
    socket.emit("newMessage", generateMessage("Admin", `Welcome to Parrot`));

    // Alert others of a new user joining.
    socket.broadcast
      .to(params.room)
      .emit(
        "newMessage",
        generateMessage("Admin", `${params.name} just entered the room.`)
      );

    callback();
  });

  // Receiving and sending messages to users
  socket.on("createMessage", (message, callback) => {
    console.log("createMessage", message);
    io.emit("newMessage", generateMessage(message.from, message.text));
    callback();
  });

  socket.on("createLocationMessage", (coords, callback) => {
    io.emit(
      "newLocationMessage",
      generateLocationMessage("User", coords.latitude, coords.longitude)
    );
  });

  // Disconnect socket
  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("updateUserList", users.getUserList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage("Admin", `${user.name} just left the room.`)
      );
    }

    console.log("User was disconnected");
  });
});

server.listen(port, err =>
  err ? console.log(err) : console.log(`Server started @ port: ${port}`)
);
