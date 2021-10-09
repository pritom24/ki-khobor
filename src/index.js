const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server);
const Filter = require("bad-words");
const { getMessage, generateLocationMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users");

const port = 3000;
const pulicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(pulicDirectoryPath));

io.on("connection", (socket) => {
  console.log("new web socket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", getMessage("Admin", "welcome"));
    socket.broadcast
      .to(user.room)
      .emit("message", getMessage("admin", `${user.username} has joined`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("bad words not allowed");
    }
    io.to(user.room).emit("message", getMessage(user.username, message));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        getMessage(`${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.data,
        users: getUserInRoom(user.room),
      });
    }
  });

  socket.on("sendlocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.emit(
      "locationmessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });
});
server.listen(port, () => {
  console.log(`server start on ${port}`);
});
