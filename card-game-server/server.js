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
      "https://inquisitive-tarsier-d80faa.netlify.app/",
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
  chats: [],
  players: [],
  host: "",
  currentTurn: undefined,
  districtsDeck: [],
  charactersDeck: [],
  gameStarted: false,
  finalTurn: false,
  finishedFirst: "",
};
let firstDraftRound = true;

io.on("connection", (socket) => {
  if (gameData.gameStarted === true) {
    socket.emit("gameAlreadyStarted");
    return;
  }

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
    });
  }

  socket.on("gameStart", () => {
    gameData.gameStarted = true;
    io.emit("gameStartedByHost", gameData);
  });

  socket.on("beginDraft", (newGameData) => {
    gameData = newGameData;
    gameData.currentTurn = gameData.players[0].userName;

    // TODO: confirm that getIndexOfPlayerByName works in second round of draft.
    // I imagine it will be fine, since I sort by king anyway, and then just up by 1 everyturn
    io.emit("draftRound", gameData);
  });

  socket.on("finalTurn", () => {
    io.emit("finalTurn");
  });

  socket.on("turnEnded", (newGameData) => {
    gameData = newGameData;
    const nextPlayerTurn =
      gameData.players[
        // for getting the next turn during character round
        getIndexOfPlayerByName(gameData.players, gameData.currentTurn) + 1
      ];

    if (nextPlayerTurn === undefined) {
      if (gameData.finalTurn) {
        io.emit("finalScores", gameData);
        return;
      }
      gameData.players = [...sortPlayersByKing(gameData.players)];

      // clear selected characters
      gameData.players.forEach((player) => (player.character = {}));
      io.emit("allPlayerTurnsCompleted", gameData);
      return;
      // I have to reset character deck - DONE
      // I have to make sure all character booleans on players are reset - DONE
      // I have to find the king's original index - DONE
      // splice an array from the kings index to the end - DONE
      // and then from the beginning to the king spliced - DONE
      // and have the new player order be those ^ 2 arrays concat together - DONE.
      // this can probably be it's own function - sortPlayersByKing - DONE
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

  socket.on("newHost", (newGameData) => {
    gameData = { ...newGameData };
    io.emit("newHost", gameData);
  });

  socket.on("districtPlayed", (newGameData) => {
    gameData = { ...newGameData };
    io.emit("updateGameData", gameData);
  });

  // when someoen closes their window
  socket.on("disconnect", (reason) => {
    let disconnectedPlayer = gameData.players.find(
      (player) => player.id == socket.id
    );
    console.log("A user disconnected " + disconnectedPlayer.userName);
    if (gameData.gameStarted === false) {
      // if we're in lobby, we remove player from lobby and reset gameData players;
      gameData.players = gameData.players.filter(
        (player) => player !== disconnectedPlayer
      );
      io.emit("disconnectedPlayer", gameData.players);
    }

    // emit disconnectedPlayer during game
    // set that player.isConnected = false;
    if (gameData.gameStarted === true) {
      // we need to somehow get player localData here.
      // There must be a way to control what is sent on disconnect.
      // ^ this might not be viable right now,

      // check if all players have characters (aka it's action round)
      if (
        gameData.players.every(
          (player) => Object.keys(player.character).length > 0
        )
      ) {
        // every player has character so we do next player turn if next player turn isnt undefined.
        // if next player turn is undefined we call next draft round
      }
      // if player disconnects midturn, maybe end turn and move to next player
      // that way I don't have to worry about local data
      // should also check if there is a next turn, and if not, do next draft round or whatever it is.
    }

    if (gameData.players.length == 0) {
      gameData = {
        chats: [],
        districtsDeck: [],
        charactersDeck: [],
        players: [],
        currentTurn: undefined,
        initOrderOfPlayers: [],
        deadCharacter: null,
        finalTurn: false,
        gameStarted: false,
        finishedFirst: "",
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
  // slice is not including the stop parameter
  let fromKingToEnd = [
    ...sortedPlayers.slice(foundKing.originalIndex, sortedPlayers.length),
  ];
  let fromStartToKing = [...sortedPlayers.slice(0, foundKing.originalIndex)];

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
