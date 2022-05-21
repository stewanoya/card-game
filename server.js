const app = require("express")();

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});

// could make it an array of objects to hold more data
let players = [];

io.on("connection", (socket) => {
  console.log("A user has connected " + socket.id);
  let newestPlayer;
  socket.on("newPlayer", (player) => {
    player.playerName = socket.id;
    if (players.length < 1) {
      player.isHost = true;
    }
    players.push(player);
    newestPlayer = players[players.length - 1];
  });

  socket.on("newPlayer", () => {
    io.emit("connectedPlayer", players);
    io.emit("initPlayerDetails", newestPlayer);
  });

  socket.on("cardPlayed", (gameObject, isPlayerA) => {
    io.emit("cardPlayed", gameObject, isPlayerA);
  });

  // when recieving this event
  socket.on("dealCards", () => {
    // also send it to other clients on this connection
    io.emit("dealCards");
  });
  // when someoen closes their window
  socket.on("disconnect", () => {
    console.log("A user disconnected " + socket.id);
    players = players.filter((player) => player.playerName !== socket.id);
    io.emit("disconnectedPlayer", players);
  });
});

http.listen(3000, () => {
  console.log("Server Started!");
});

const getOpponents = (player, array) => {
  return array.filter((enemy) => player.playerName !== enemy.playerName);
};
