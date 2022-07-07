<template>
  <div class="lobby">
    <Lobby :players="gameData.players"></Lobby>
    <button
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
    const socket = io("http://localhost:3000");
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
  justify-content: center;
  align-items: center;
}
</style>
