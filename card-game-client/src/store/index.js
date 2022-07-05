import { createStore } from "vuex";
import io from "socket.io-client";
import Player from "@/helpers/player";
import { getPlayerIndex } from "@/helpers/getPlayerIndex";

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
      return state.gameData.players
        .filter((opponent) => opponent.userName != state.player.userName)
        .sort((a, b) => a.originalIndex - b.originalIndex);
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
  },
  actions: {},
  modules: {},
});
