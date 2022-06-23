const app = require("express")();

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});
const { v4: uuidv4 } = require("uuid");

// could make it an array of objects to hold more data
let gameData = {
  players: [],
  host: "",
  currentTurn: undefined,
  districtsDeck: [],
  charactersDeck: [],
  gameStarted: false,
};
let firstDraftRound = true;

io.on("connection", (socket) => {
  socket.on("newPlayer", (player) => {
    player.id = socket.id;
    console.log("A user has connected " + player.userName);

    if (gameData.players.length < 1) {
      gameData.host = player.userName;
      player.isHost = true;
    }
    gameData.players.push(player);
    io.emit("initPlayerDetailsLobby", gameData.players);
    io.emit("connectedPlayer", gameData.players);
  });

  if (!gameData.gameStarted) {
    socket.on("getDeckReady", (decks) => {
      gameData.districtsDeck = decks.districtsDeck;
      gameData.charactersDeck = decks.charactersDeck;
      gameData.districtsDeck.forEach((card) => {
        card.id = uuidv4();
      });
      gameData.players.forEach((player) => {
        let card1 = gameData.districtsDeck.shift();
        let card2 = gameData.districtsDeck.shift();
        let card3 = gameData.districtsDeck.shift();
        let card4 = gameData.districtsDeck.shift();
        player.cards = [card1, card2, card3, card4];
        player.gold = 10;
      });
      gameData.currentTurn = gameData.players[0].userName;
      io.emit("initPlayerDetails", gameData);
      gameData.gameStarted = true;
    });
  }

  socket.on("gameStart", () => {
    io.emit("gameStartedByHost");
  });

  socket.on("beginDraft", () => {
    if (firstDraftRound) {
      gameData.charactersDeck = burnCard(gameData.charactersDeck);
      firstDraftRound = false;
    }
    io.emit("draftRound", gameData);
  });

  socket.on("nextDraftRound", (newGameData) => {
    gameData = newGameData;

    const nextPlayerTurn =
      gameData.players[
        getIndexOfPlayerByName(gameData.players, gameData.currentTurn) + 1
      ];

    if (nextPlayerTurn === undefined) {
      gameData.players.sort(
        (player1, player2) => player1.character.value - player2.character.value
      );
      gameData.currentTurn = gameData.players[0].userName;
      return io.emit("allPlayersDrafted", gameData);
    }

    gameData.currentTurn = nextPlayerTurn.userName;
    io.emit("draftRound", gameData);
  });

  socket.on("districtPlayed", (gameData) => {
    console.log("HERE IS INCOMING DATA", gameData.players[0].districts);
  });

  // when someoen closes their window
  socket.on("disconnect", () => {
    console.log("A user disconnected " + socket.id);
    gameData.players = gameData.players.filter(
      (player) => player.id !== socket.id
    );
    io.emit("disconnectedPlayer", gameData.players);
    if (gameData.players.length == 0) {
      gameData = {
        players: [],
        host: "",
        currentTurn: undefined,
        districtsDeck: [],
        charactersDeck: [],
        gameStarted: false,
      };
      firstDraftRound = true;
      // TODO: Think of a better solution for no players in room.
    }
  });
});

http.listen(3000, () => {
  console.log("Server Started!");
});

const getOpponents = (player, array) => {
  return array.filter((enemy) => player.playerName !== enemy.playerName);
};

const burnCard = (cards) => {
  cards.splice(Math.floor(Math.random() * cards.length), 1);
  return cards;
};

const getIndexOfPlayerByName = (players, currentTurnName) => {
  let foundIndex;
  players.forEach((player, index) => {
    if (player.userName == currentTurnName) {
      foundIndex = index;
    }
  });

  return foundIndex;
};
