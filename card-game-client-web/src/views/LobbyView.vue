<template>
  <div class="lobby">
    <div v-if="!this.player">
      <label>Please enter a username</label>
      <n-input @input="onUserNameChange" placeholder="Make it unique!" />
      <n-button type="success" @click="initConnect">Connect</n-button>
    </div>
    <Lobby
      :players="gameData.players"
      :socket="socket"
      v-if="this.player"
    ></Lobby>

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
      const socket = io("https://card-game-server1.herokuapp.com/");
      // const socket = io("http://localhost:5000/");
      store.commit("setSocket", socket);
      socket.on("connect", () => {
        store.commit("createNewPlayer", chosenName);
        socket.emit("newPlayer", this.player);
      });
      socket.on("gameAlreadyStarted", () => {
        store.commit("setPlayer", null);
        // somehow keep username and check it against gamedata
        // I would pass gamedata back from server
        // if the username is the exact same, this player can jump into that position;
        // I have to catch the disconnect, so ti doesn't remove the player
      });
      socket.on("disconnectedPlayer", (newPlayersInfo) => {
        store.commit("updatePlayers", newPlayersInfo);
      });

      socket.on("connectedPlayer", (players) => {
        store.commit("updatePlayers", players);
        store.commit("updatePlayerFromGameData", players);
      });

      socket.on("gameStartedByHost", (newGameData) => {
        store.commit("updateGameData", newGameData);
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
      "setPlayer",
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
