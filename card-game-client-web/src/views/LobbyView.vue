<template>
  <div class="lobby">
    <div v-if="!player" class="username-container" style="width: 30%">
      <label>Please enter a username</label>
      <n-input
        @keyup.enter="initConnect"
        @input="onUserNameChange"
        placeholder="Make it unique!"
      />
      <n-button type="success" @click="initConnect">Connect</n-button>
      <p v-if="error">{{ error }}</p>
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
      v-if="player && player.isHost"
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
      error: "",
    };
  },
  computed: {
    ...mapState(["socket", "player", "gameData"]),
    isNameTaken() {
      console.log(this.gameData.players);
      let match = this.gameData.players.find(
        (p) => p.userName === this.chosenUserName
      );
      return !!match;
    },
  },
  methods: {
    onUserNameChange(e) {
      this.error = "";
      this.chosenUserName = e;
    },
    initConnect() {
      if (!this.chosenUserName) {
        this.error = "Please enter a valid username";
        return;
      }

      if (this.isNameTaken) {
        this.error = "I said make it unique! That name is taken.";
        return;
      }

      if (this.chosenUserName === "System") {
        this.error = "This name is reserved";
        return;
      }
      console.log("CONNECT CLICKED");
      this.connectPlayer(this.chosenUserName);
    },
    connectPlayer(chosenName) {
      // const socket = io("card-game-server-production.up.railway.app/", {
      //   withCredentials: false,
      // });
      const socket = io("http://localhost:5000/");
      store.commit("setSocket", socket);
      socket.on("connect", () => {
        socket.emit("newPlayer", chosenName);
      });

      // socket.on("disconnectedPlayer", (newPlayersInfo) => {
      //   store.commit("updatePlayers", newPlayersInfo);
      // });

      
      socket.on("updateGameData", (gameData) => {
        console.log("gameData", gameData);
        store.commit("updateGameData", gameData);
        store.commit("updatePlayerFromGameData", gameData.players);
        console.log("PLAYER", this.player);
      });

      socket.on("playerReconnect", (gameData) => {
        store.commit("updateGameData", gameData);
        store.commit("updatePlayerFromGameData", gameData.players);
        console.log("INCOMING GAMEDATA", gameData);
        return router.push("/game");
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

.username-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
