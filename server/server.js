const http = require("http");
const fs = require('fs');
const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const moment = require("moment");
const multer = require('multer');
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");
const Cache = require("./utils/cache");
const bodyParser = require('body-parser');

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3030;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

// let cache = new Cache();
// cache.retrieveCache();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicPath));
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let room = req.query.room;
    let dirPath = path.join(__dirname, "../db", `${room}`);
    fs.exists(dirPath, (exists) => {
      if(exists){
        return cb(null, dirPath);
      }
      fs.mkdir(dirPath, (err) => {
        if(err){
          console.log(err);
        }
        cb(null, dirPath)
      });
    })
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({storage: fileStorage});

app.get("/", (req, res) => {
  res.sendFile("./index.html");
});

app.get('/download/:file', (req, res, next) => {
  let file_name = req.params.file.slice(1);
  const filePath = path.join(__dirname, '../db', req.query.room, file_name);
  fs.exists(filePath, exists => {
    if(exists){
      res.download(filePath);
    }
    else {
      res.write(`<script> (function(){
      alert('File does not exist.');
      window.close();
    })();
      </script>`);
      res.end();
    }
  });
});

app.post("/upload", upload.array('filetoupload'), (req, res, next) => {
  let filesToAppend = req.files;
  let room = req.query.room;
  filesToAppend.forEach(file => {
    res.write(`<a style="float: left; font-size: 1rem; padding: 0px 15px;" 
    target="_blank" href="/download/:${file.originalname}?room=${room}">${file.originalname}</a>`);
  })
  res.end();
});

// Init socket connection
io.on("connection", socket => {
  console.log("New user connected.");

  // Join room
  socket.on("join", (params, callback) => {
    params.room = params.room.toLowerCase();
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback("Username and Room are required.");
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
    io.to(params.room).emit("updateUserList", users.getUserList(params.room));

    // Greet new user.
    socket.emit("newMessage", generateMessage(`Admin`, `Welcome to Scrinam`));
    socket.emit(
      "newMessage",
      generateMessage(
        `Admin :: ${moment().format("dddd")},`,
        moment().format("MMMM D")
      )
    );

    let links = users.getRoomLinks(params.room);
    if(links){
      links.forEach(link => socket.emit("updateLinks", link.file_link));
    }

    // Alert others of a new user joining.
    socket.broadcast
      .to(params.room)
      .emit(
        "newMessage",
        generateMessage(`Admin :: ${params.name}`, `just entered the room.`)
      );

    callback();
  });

  // Receiving and sending messages to users
  socket.on("createMessage", (message, callback) => {
    let user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit(
        "newMessage",
        generateMessage(user.name, message.text)
      );
    }
    if(callback) {
      callback();
    }
  });

  socket.on("createLocationMessage", (coords, callback) => {
    let user = users.getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "newLocationMessage",
        generateLocationMessage(user.name, coords.latitude, coords.longitude)
      );
    }
    callback();
  });

  socket.on("new_notification", function(data, callback) {
    let recievers = users.users.filter(user => user.id === socket.id);
    recievers.forEach(user => {
      io.to(user.id).emit("show_notification", {
        title: data.title,
        message: data.message
      });  
    });
    if (callback) {
      callback();
    }
  });

  socket.on("addLinks", (file_link, room) => {
    users.addLink(file_link, room);
    users.users.forEach(user => {
      io.to(user.id).emit("updateLinks", file_link);
    });
  });

  // Disconnect socket
  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("updateUserList", users.getUserList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage(`Admin :: ${user.name}`, `just left the room.`)
      );
    }

    console.log("User was disconnected");
  });
});

server.listen(port, err =>
  err ? console.log(err) : console.log(`Server started @ port: ${port}`)
);
