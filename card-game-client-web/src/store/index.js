import { createStore, storeKey } from "vuex";
import io from "socket.io-client";
import Player from "@/helpers/player";
import getPlayerIndex from "@/helpers/getPlayerIndex.js";

export default createStore({
  state: {
    socket: "",
    player: "",
    gameData: {
      districtsDeck: [],
      charactersDeck: [],
      players: [],
      currentTurn: undefined,
      lastCardDestroyed: { userName: null, cardData: null },
      initOrderOfPlayers: [],
      charactersArray: [],
      deadCharacter: null,
      gameStarted: false,
      finalTurn: false,
      finishedFirst: "",
    },
    chats: [],
    initPlayerDetails: false,
    init: false,
  },
  getters: {
    socket(state) {
      return state.socket;
    },
    player(state) {
      return state.player;
    },
    gameData(state) {
      return state.gameData;
    },
    init(state) {
      return state.init;
    },
    // this should only be used for the table
    // I'm dumb, i shouldve made a seperate more specific one for eht table
    // and another that would be just for getting opponents for other things.
    opponents(state) {
      let copyOfPlayers1 = [...state.gameData.players]; // I seperated these since sort mutates the array
      let copyOfPlayers2 = [...state.gameData.players]; // I didn't want to conflict with player 1s layout.
      // could probably be changed back to just have 1 copy.
      if (state.player.originalIndex === 0) {
        return copyOfPlayers1
          .filter((opponent) => opponent.userName != state.player.userName)
          .sort((a, b) => a.originalIndex - b.originalIndex);
      }
      copyOfPlayers2.sort((a, b) => a.originalIndex - b.originalIndex);

      let indexOfPlayer = state.player.originalIndex;

      let leftSide = [...copyOfPlayers2.slice(0, indexOfPlayer)];
      let rightSide = [...copyOfPlayers2.slice(indexOfPlayer + 1)];
      // have to swap the sides to emualte sitting around a table
      // see clickup for info.
      return [...rightSide, ...leftSide];
    },
  },
  mutations: {
    setFinalTurn(state) {
      state.gameData.finalTurn = true;
    },
    updateDeadCharacter(state, characterName) {
      state.gameData.deadCharacter = characterName;
    },
    removeHost(state) {
      state.gameData.players.forEach((player) => (player.isHost = false));
    },
    updateCharacterCards(state, charactersCards) {
      state.gameData.charactersDeck;
    },
    toggleInitPlayerDetails(state, newStatus) {
      state.initPlayerDetails = newStatus;
    },
    createNewPlayer(state, userName) {
      state.player = new Player();
      state.player.userName = userName;
    },
    setSocket(state, socket) {
      state.socket = socket;
    },
    updatePlayers(state, players) {
      state.gameData.players = players;
    },
    updatePlayerFromGameData(state, players) {
        if (state.player) {
          state.player = players.filter(
            (player) => player.userName === state.player.userName
          )[0];
        } else {
          state.player = players.find(i => i.id === state.socket.id);
        }
    },
    updatePlayerToGameData(state, newPlayerData) {
      state.gameData.players[getPlayerIndex(state, newPlayerData.userName)] = {
        ...newPlayerData,
      };
    },
    updateGameData(state, gameData) {
      state.gameData = gameData;
    },
    updatePlayerHand(state, newHand) {
      state.player.cards = [...newHand];
    },
    updateInit(state, payload) {
      state.init = payload;
    },
    destroyPlayedCard(state, payload) {
      let costSubtraction =
        payload.greatWall && payload.cardToDestroy.districtName !== "Great Wall"
          ? 0
          : 1;
      console.log("COST SUBTRACTION DPC", costSubtraction);
      console.log("CARD COST", payload.cardToDestroy.cost);
      let foundPlayer = state.gameData.players.find(
        (player) => player.userName == payload.userName
      );
      foundPlayer.districts = foundPlayer.districts.filter(
        (card) => card.id !== payload.cardToDestroy.id
      );

      state.gameData.players[getPlayerIndex(state, foundPlayer.userName)] = {
        ...foundPlayer,
      };
      console.log("gold before", state.player.gold);
      let difference =
        state.player.gold -
        (Number(payload.cardToDestroy.cost) - costSubtraction);

      console.log("DIFFERENCE AFTER DESTROYING", difference);
      state.player.gold = difference;
      console.log("gold after", state.player.gold);
    },

    updateChat(state, payload) {
      state.chats = [...payload];
    },
  },
  actions: {},
  modules: {},
});
