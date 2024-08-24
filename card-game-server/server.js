import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { Server } from 'socket.io';
import { createServer } from 'http'

import GameData from "./models/gameData.js";

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
dotenv.config();
const app = express();
app.use(cors());

const http = createServer(app);
const io = new Server(http, {
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
// could make it an array of objects to hold more data
let gameData = new GameData();
let firstDraftRound = true;

io.on("connection", (socket) => {


  socket.on("newPlayer", (name) => {
    let player = gameData.createNewPlayer(name, socket.id);
    console.log("A user has connected " + name);

    if (gameData.players.length < 1) {
      gameData.host = player.userName;
      player.isHost = true;
    }
    player.originalIndex = gameData.players.length;
    gameData.players.push(player);
    io.emit("updateGameData", gameData);
  });

  socket.on("draftCharacter", (character) => {
    let currentPlayer = gameData.getCurrentPlayer();
    console.log(currentPlayer);
    currentPlayer.character = character;
    // const index = gameData.charactersDeck.indexOf(character);
    // console.log("INDEX", index);
    // gameData.charactersDeck[index].drafted = true;
    gameData.setCharacterToDrafted(character);
    currentPlayer.showCharacterCards = false;
    gameData.nextDraftTurn();
    // this.newChat(`${this.player.userName} has drafted a character`, "System");
    io.emit("updateGameData", gameData);
  })


  socket.on("gameStart", () => {
    gameData.buildDistrictsDeck();
    gameData.prepareCharacterCards();
    gameData.burnCharacterCards();
    gameData.getReadyForFirstRound();
    io.emit("gameStartedByHost");
    io.emit("updateGameData", gameData);
  });

  // socket.on("beginDraft", (newGameData) => {
  //   gameData = newGameData;
  //   gameData.currentTurn = gameData.players[0].userName;

  //   // TODO: confirm that getIndexOfPlayerByName works in second round of draft.
  //   // I imagine it will be fine, since I sort by king anyway, and then just up by 1 everyturn
  //   io.emit("draftRound", gameData);
  // });

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

      // prepare for next draft round
      gameData.players.forEach((player) => (player.character = {}));
      gameData.prepareCharacterCards();
      gameData.burnCharacterCards();
      gameData.resetPlayerLocalValues();
      // I have to reset character deck - DONE
      // I have to make sure all character booleans on players are reset - DONE
      // I have to find the king's original index - DONE
      // splice an array from the kings index to the end - DONE
      // and then from the beginning to the king spliced - DONE
      // and have the new player order be those ^ 2 arrays concat together - DONE.
      // this can probably be it's own function - sortPlayersByKing - DONE
    }

    if (gameData.lastCardDestroyed) {
      gameData.graveYardAbilityCheck();
    }

    gameData.currentTurn = nextPlayerTurn.userName;

    nextPlayerTurn.gatherResources = true;
    //TODO: maybe create system chat to say this player is king?
    const isKing = gameData.isCurrentPlayerKing();

    if (isKing) {
      // remove king status on previous king
      gameData.removeKingStatusFromPrevKing();
    }

    if (nextPlayerTurn.isAlive === false) {
      nextPlayerTurn.isAlive = true;
      //TODO: Handle turn ended if assassinated
      // this.socket.emit("turnEnded", this.gameData);
    }

    if (nextPlayerTurn.isMarkedForTheft) {
      gameData.giveAllGoldToTheif();
    }

    io.emit("updateGameData", gameData);
  });

  socket.on("showPowerScreen", () => {
    let currentPlayer = gameData.getCurrentPlayer();
    currentPlayer.showPowerScreen = !currentPlayer.showPowerScreen;
    console.log("SHOW POWER SCREEN", currentPlayer.showPowerScreen);
    io.emit("updateGameData", gameData);
  })

  socket.on("killPlayer", (characterName) => {
    let currentPlayer = gameData.getCurrentPlayer();

    gameData.deadCharacter = characterName;

    let foundPlayerToKill = gameData.getPlayerByCharacterName(characterName);
    
    if (foundPlayerToKill) {
      foundPlayerToKill.isAlive = false;
    }
    // this.newChat(
    //   `${this.player.userName} as the Assassin has killed the ${characterName}!`,
    //   "System"
    // );
    io.emit("updateGameData", gameData);
  })

  socket.on("markPlayerForTheft", (playerToStealFrom) => {
    // this.newChat(
    //   `${this.player.userName} as the Thief will be stealing from the ${characterName}.`,
    //   "System"
    // );
    let currentPlayerTurn = gameData.getCurrentPlayer();
    let foundPlayer = gameData.players.find(
      (player) => player.id === playerToStealFrom.id
    );
    if (foundPlayer) {
      foundPlayer.isMarkedForTheft = true;
    }
    currentPlayerTurn.powerUsed = true;
    currentPlayerTurn.showPowerScreen = false;
    io.emit("updateGameData", gameData);
  })

  socket.on("destroyCard", ({cardToDestroy, targetUserName}) => {
    let currentPlayer = gameData.getCurrentPlayer();
    console.log(cardToDestroy);

    if (cardToDestroy.districtName === "Keep") {
      return;
    }

    let costSubtraction = -1;
    let hasGreatWall = gameData.doesPlayerHaveGreatWall(targetUserName);
    console.log("HASGREATWALL", hasGreatWall);

    costSubtraction = hasGreatWall && cardToDestroy.districtName !== "Great Wall" ? 0 : 1;

    console.log("costSubtraction dcHandler", hasGreatWall);
    if (currentPlayer.gold < Number(cardToDestroy.cost) - costSubtraction) {
      console.log("NOT ENOUGH MONEY");
      return;
    }

    if (this.playedCards.length === 7) {
      console.log("CITY COMPLETE");
      //do nothing if completed city
      return;
    }

    const data = { cardToDestroy, targetUserName, greatWall: hasGreatWall };
    gameData.destroyPlayedCard(data);
    gameData.lastCardDestroyed = { targetUserName, cardData: cardToDestroy };
    currentPlayer.isDestroying = false;
    currentPlayer.canDestroy = false;
    // store.commit("destroyPlayedCard", data);
    io.emit("updateGameData", this.gameData);
  })

  // socket.on("burnCards", () => {
  //   io.emit("updateGameData", gameData);
  // })

  socket.on("canPlayDistrictHandler", ({card, isDblClick, cardDataFromDoubleClick}) => {
    let currentPlayer = gameData.getCurrentPlayer();

    currentPlayer.cardCanBePlayed = false;
    const cardData = isDblClick
      ? [
          cardDataFromDoubleClick.cost,
          cardDataFromDoubleClick.districtName,
          cardDataFromDoubleClick.type,
        ]
      : card.item.innerText.split("\n");
    const cardCost = Number(cardData[0]);
    const cardName = cardData[1];
    const cardType = cardData[3];
    const hasCardAlreadyBeenPlayed = gameData.hasCardAlreadyBeenPlayed(cardName);
    currentPlayer.rememberCardCost = cardCost;
    // TODO: replace this crazy if statement with something more readable/maintainable
    if (
      currentPlayer.gold >= cardCost &&
      !currentPlayer.districtPlayed &&
      !hasCardAlreadyBeenPlayed &&
      currentPlayer.showPowerScreen
    ) {
      currentPlayer.cardCanBePlayed = true;
    }
    io.emit("updateGameData", gameData);
  });

  socket.on("districtPlayed", (card) => {
    let currentPlayer = gameData.getCurrentPlayer();
    currentPlayer.cardCanBePlayed = false;
    currentPlayer.districtPlayed = true;
    currentPlayer.gold -= currentPlayer.rememberCardCost;
    gameData.isCurrentPlayerArchitect();
    if (currentPlayer.districts.length === 7) {
      currentPlayer.districtPlayed = true; // set to true as to not build more than 7 even if architect
      if (gameData.finishedFirst === "") {
        gameData.finishedFirst = this.player.userName;
      }
      if (!gameData.finalTurn) {
        //TODO: do something on this emit..
        gameData.finalTurn = true;
        io.emit("finalTurn");
        // store.commit("setFinalTurn");
      }
    }
    // this.newChat(`${this.player.userName} played a district.`, "System");
    currentPlayer.cards = currentPlayer.cards.filter((c) => c.id !== card.id);
    currentPlayer.districts.push(card);
    io.emit("updateGameData", gameData);
  })

  // socket.on("updateGameData", (newGameData) => {
  //   gameData = newGameData;
  //   io.emit("updateGameData", gameData);
  // });

  // socket.on("nextDraftRound", (newGameData) => {
  //   gameData = newGameData;

  //   const nextPlayerTurn =
  //     gameData.players[
  //       getIndexOfPlayerByName(gameData.players, gameData.currentTurn) + 1
  //     ];

  //   if (nextPlayerTurn === undefined) {
  //     gameData.players.sort(
  //       (player1, player2) => player1.character.value - player2.character.value
  //     );
  //     let firstPlayerTurn = gameData.players[0];
  //     firstPlayerTurn.gatherResources = true;
  //     const isKing = firstPlayerTurn.checkIfPlayerIsKing();
  //     if (isKing) {
  //       // remove king status on previous king
  //       gameData.removeKingStatusFromPrevKing();
  //     }
  //     gameData.currentTurn = firstPlayerTurn.userName;
  //     return io.emit("updateGameData", gameData);
  //   }

  //   gameData.currentTurn = nextPlayerTurn.userName;
  //   io.emit("draftRound", gameData);
  // });

  socket.on("newHost", (playerId) => {
    gameData.updateHost(playerId);
    io.emit("updateGameData", gameData);
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

    if (gameData.gameStarted === true) {
      // we need to somehow get player localData here.
      // There must be a way to control what is sent on disconnect.
      // ^ this might not be viable right now,

      // check if all players have characters (aka it's action round)
      if (
        gameData.players.every((player) => Object.keys(player.character).length > 1)
      ) {
        // every player has character so we do next player turn if next player turn isnt undefined.
        // if next player turn is undefined we call next draft round
      }
      // if player disconnects midturn, maybe end turn and move to next player
      // that way I don't have to worry about local data
      // should also check if there is a next turn, and if not, do next draft round or whatever it is.
    }

    if (gameData.players.length == 0) {
      gameData.reset();
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


