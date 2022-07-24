<template>
  <div class="lobby">
    <Lobby :players="gameData.players" :socket="socket"></Lobby>

    <n-button
      color="#452059"
      class="lobby-button"
      :disabled="gameData.players.length < 1"
      v-if="player.isHost"
      @click="startGame"
    >
      Start Game
    </n-button>
  </div>
</template>

<script setup>
import { NButton, useMessage } from "naive-ui";
</script>

<script>
// @ is an alias to /src
import Lobby from "@/components/Lobby.vue";
import router from "@/router";
import store from "@/store";
import io from "socket.io-client";
import { mapGetters, mapState, mapMutations } from "vuex";

export default {
  created() {
    // const socket = io("https://card-game-server1.herokuapp.com/");
    const socket = io("http://localhost:5000/");
    store.commit("setSocket", socket);

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
  width: 30%;
  max-width: 500px;
  height: 80px;
  border: 2px solid #380256;
  border-radius: 10px;
  font-size: 20px;
}
</style>
