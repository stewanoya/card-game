<template>
  <div class="lobby">
    <div v-if="!player">
      <label>Please enter a username</label>
      <n-input @input="onUserNameChange" placeholder="Make it unique!" />
      <n-button type="success" @click="initConnect">Connect</n-button>
    </div>
    <Lobby
      :players="gameData ? gameData.players : []"
      :socket="socket"
      v-if="player"
    ></Lobby>

    <n-button
      color="#452059"
      class="lobby-button"
      :disabled="!gameData || gameData.players.length < 1"
      v-if="player.isHost"
      @click="startGame"
    >
      Start Game
    </n-button>
  </div>
</template>

<script setup>
import { NButton, useMessage, NInput } from "naive-ui";
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
    if (!this.player) {
    }
  },
  name: "LobbyView",
  components: {
    Lobby,
    NButton,
    useMessage,
    NInput,
  },
  fetch() {
    this.connectPlayer();
  },
  data() {
    return {
      chosenUserName: "",
    };
  },
  computed: {
    ...mapState(["socket", "player", "gameData"]),
  },
  methods: {
    onUserNameChange(e) {
      this.chosenUserName = e;
    },
    initConnect() {
      this.connectPlayer(this.chosenUserName);
    },
    connectPlayer(chosenName) {
<<<<<<< HEAD
      const socket = io("https://http-nodejs-production-d057.up.railway.app/", {
        withCredentials: false,
      });
      // const socket = io("http://localhost:5000/");
=======
      // const socket = io("https://card-game-server1.herokuapp.com/");
      const socket = io("http://localhost:5000/");
>>>>>>> parent of 56526cb (minor changes to links)
      store.commit("setSocket", socket);
      socket.on("connect", () => {
        store.commit("createNewPlayer", chosenName);
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
    startGame() {
      this.socket.emit("gameStart");
    },
    ...mapMutations([
      "toggleInitPlayerDetails",
      "createNewPlayer",
      "setSocket",
      "updatePlayers",
      "updatePlayerFromGameData",
      "updateGameData",
    ]),
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
