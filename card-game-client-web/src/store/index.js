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
      initOrderOfPlayers: [],
    },
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
    updateCharacterCards(state, charactersCards) {
      state.gameData.charactersDeck;
    },
    toggleInitPlayerDetails(state, newStatus) {
      state.initPlayerDetails = newStatus;
    },
    createNewPlayer(state) {
      state.player = new Player();
      state.player.userName = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 5);
    },
    setSocket(state, socket) {
      state.socket = socket;
    },
    updatePlayers(state, players) {
      state.gameData.players = players;
    },
    updatePlayerFromGameData(state, players) {
      state.player = players.filter(
        (player) => player.userName === state.player.userName
      )[0];
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
      let foundPlayer = state.gameData.players.find(
        (player) => player.userName == payload.userName
      );
      foundPlayer.districts = foundPlayer.districts.filter(
        (card) => card.id !== payload.cardToDestroy.id
      );

      state.gameData.players[getPlayerIndex(state, foundPlayer.userName)] = {
        ...foundPlayer,
      };

      state.player.gold -= payload.cardToDestroy.cost - 1;
    },
  },
  actions: {},
  modules: {},
});
