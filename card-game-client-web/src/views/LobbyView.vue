<template>
  <div class="lobby">
    <Lobby :players="gameData.players"></Lobby>
    <button
      class="lobby-button"
      :disabled="gameData.players.length < 1"
      v-if="player.isHost"
      @click="startGame"
    >
      Start Game
    </button>
  </div>
</template>

<script>
// @ is an alias to /src
import Lobby from "@/components/Lobby.vue";
import router from "@/router";
import store from "@/store";
import io from "socket.io-client";
import { mapGetters, mapState, mapMutations } from "vuex";

export default {
  created() {
    const socket = io("https://card-game-server1.herokuapp.com/");
    socket.on("connect", () => {
      store.commit("createNewPlayer");
      socket.emit("newPlayer", this.player);
    });

    socket.on("disconnectedPlayer", (newPlayersInfo) => {
      store.commit("updatePlayers", newPlayersInfo);
    });

    socket.on("connectedPlayer", (players) => {
      store.commit("updatePlayers", players);
      store.commit("updatePlayerFromGameData", players);
      store.commit("setSocket", socket);
    });

    socket.on("gameStartedByHost", () => {
      return router.push("/game");
    });
  },
  name: "LobbyView",
  components: {
    Lobby,
  },
  fetch() {
    this.connectPlayer();
  },
  computed: {
    ...mapMutations([
      "toggleInitPlayerDetails",
      "createNewPlayer",
      "setSocket",
      "updatePlayers",
      "updatePlayerFromGameData",
      "updateGameData",
    ]),
    ...mapState(["socket", "player", "gameData"]),
  },
  methods: {
    connectPlayer() {},
    startGame() {
      this.socket.emit("gameStart");
    },
  },
};
</script>

<style scoped>
.lobby {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.lobby-button {
  margin-top: 20px;
  width: 25%;
  height: 50px;
  border-radius: 10px;
  border: none;
  background-color: #551e73;
  font-size: 18px;
  font-weight: bold;
  color: white;
  border: 2px solid #1c0727;
  box-shadow: 0px 4px 8px #00000042;
}
</style>
