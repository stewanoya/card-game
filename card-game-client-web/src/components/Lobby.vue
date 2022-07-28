<template>
  <n-card class="lobby-container" title="Players">
    <ul v-for="player in players" :key="player.socket">
      <li>
        <h4 class="player-username">{{ player.userName }}</h4>
        <n-tag v-if="player.isHost" class="host-text" type="info" round
          >Host</n-tag
        >
        <n-tag
          type="warning"
          v-if="players[0] === player"
          round
          class="host-text"
          >Drafts First</n-tag
        >
      </li>
    </ul>
    <template #footer v-if="player.isHost">
      <n-dropdown
        trigger="hover"
        :options="dropDownOptions"
        @select="handleSelectNewHost"
      >
        <n-button>Pick a new host</n-button>
      </n-dropdown>
    </template>
  </n-card>
</template>

<script setup>
import { NCard, NTag, NDropdown, NButton } from "naive-ui";
import { onUnmounted } from "vue";

onUnmounted(() => {});
</script>

<script>
import { mapState, mapMutations } from "vuex";
import store from "../store";
export default {
  name: "Lobby",
  props: {
    players: { type: Array, required: false, default: [] },
    socket: { type: Object, required: true },
  },
  components: {
    NCard,
    NTag,
    NDropdown,
    NButton,
  },
  data() {
    return {};
  },
  created() {
    this.socket.on("newHost", (gameData) => {
      store.commit("updateGameData", gameData);
      store.commit("updatePlayerFromGameData", gameData.players);
      console.log("new host selected!", this.gameData);
    });
  },
  computed: {
    ...mapState(["player", "gameData"]),
    dropDownOptions() {
      const options = [];
      this.players.forEach((playerItem) => {
        if (playerItem.userName !== this.player.userName) {
          const playerOptions = {};
          playerOptions.label = playerItem.userName;
          playerOptions.key = playerItem;
          options.push(playerOptions);
        }
      });
      return options;
    },
  },
  methods: {
    ...mapMutations([
      "removeHost",
      "updatePlayerToGameData",
      "updatePlayerFromGameData",
      "updateGameData",
    ]),
    handleSelectNewHost(chosenPlayer) {
      store.commit("removeHost");
      chosenPlayer.isHost = true;
      store.commit("updatePlayerToGameData", chosenPlayer);
      this.socket.emit("newHost", this.gameData);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li {
  list-style-type: none;
  display: flex;
  justify-content: start;
  align-items: center;
}
.lobby-container {
  width: 60%;
  height: 40%;
  background-color: rgb(240, 240, 240);
  border-radius: 10px;
  box-shadow: 0px 4px 10px #00000080;
  padding: 30px;
  max-height: 600px;
  max-width: 600px;
  overflow-y: auto;
}
.player-username {
  color: rgb(3, 2, 19);
  font-size: 25px;
  font-weight: bold;
}
.host-text {
  font-size: 12px;
  margin-left: 10px;
}
</style>
