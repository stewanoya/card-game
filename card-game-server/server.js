const cors = require("cors");
require("dotenv").config();
const app = require("express")();
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors());
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: [
      "http://localhost:3000",
      // "app://.",
      "inquisitive-tarsier-d80faa.netlify.app",
      "https://inquisitive-tarsier-d80faa.netlify.app",
      // "http://localhost:4173",
      "https://62c63ee446dacf234ae5e10f--inquisitive-tarsier-d80faa.netlify.app/#/",
      "https://62c63ee446dacf234ae5e10f--inquisitive-tarsier-d80faa.netlify.app/",
      "http://62c63ee446dacf234ae5e10f--inquisitive-tarsier-d80faa.netlify.app/#/",
    ],
    allowedHeaders: ["Access-Control-Allow-Origin"],
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
    player.originalIndex = gameData.players.length;
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
      gameData.initOrderOfPlayers = [...gameData.players];
      gameData.players.forEach((player) => {
        let card1 = gameData.districtsDeck.shift();
        let card2 = gameData.districtsDeck.shift();
        let card3 = gameData.districtsDeck.shift();
        let card4 = gameData.districtsDeck.shift();
        player.cards = [card1, card2, card3, card4];
        player.gold = 2;
      });
      io.emit("initPlayerDetails", gameData);
      gameData.gameStarted = true;
    });
  }

  socket.on("gameStart", () => {
    io.emit("gameStartedByHost");
  });

  socket.on("beginDraft", (newGameData) => {
    gameData = newGameData;
    gameData.currentTurn = gameData.players[0].userName;

    // TODO: confirm that getIndexOfPlayerByName works in second round of draft.
    // I imagine it will be fine, since I sort by king anyway, and then just up by 1 everyturn
    io.emit("draftRound", gameData);
  });

  socket.on("turnEnded", (newGameData) => {
    gameData = newGameData;
    const nextPlayerTurn =
      gameData.players[
        // for getting the next turn during character round
        getIndexOfPlayerByName(gameData.players, gameData.currentTurn) + 1
      ];

    if (nextPlayerTurn === undefined) {
      gameData.players = [...sortPlayersByKing(gameData.players)];
      io.emit("allPlayerTurnsCompleted", gameData);
      return;
      // I have to reset character deck
      // I have to make sure all character booleans on players are reset
      // I have to find the king's original index - DONE
      // splice an array from the kings index to the end - DONE
      // and then from the beginning to the king spliced - DONE
      // and have the new player order be those ^ 2 arrays concat together - DONE.
      // this can probably be it's own function - sortPlayersByKing
    }

    gameData.currentTurn = nextPlayerTurn.userName;

    io.emit("nextPlayerTurn", gameData);
  });

  socket.on("updateGameData", (newGameData) => {
    gameData = newGameData;
    io.emit("updateGameData", gameData);
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

  socket.on("districtPlayed", (newGameData) => {
    gameData = { ...newGameData };
    io.emit("updateGameData", gameData);
  });

  // when someoen closes their window
  socket.on("disconnect", () => {
    let disconnectedPlayer = gameData.players.find(
      (player) => player.id == socket.id
    );
    console.log("A user disconnected " + disconnectedPlayer.userName);
    gameData.players = gameData.players.filter(
      (player) => player !== disconnectedPlayer
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

const sortPlayersByKing = (players) => {
  let foundKing = players.find((player) => player.isKing === true);
  let sortedPlayers = [
    ...players.sort((a, b) => a.originalIndex - b.originalIndex),
  ];
  if (!foundKing) {
    return sortedPlayers;
  }
  let fromKingToEnd = [
    ...sortedPlayers.splice(foundKing.originalIndex, sortedPlayers.length - 1),
  ];
  let fromStartToKing = [...sortedPlayers];

  return [...fromKingToEnd, ...fromStartToKing];
};

http.listen(process.env.PORT || 5000, () => {
  console.log("Server Started!");
});

const getOpponents = (player, array) => {
  return array.filter((enemy) => player.playerName !== enemy.playerName);
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
