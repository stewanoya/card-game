<template>
  <div class="lobby-container">
    <ul v-for="player in players" :key="player.socket">
      <li>
        <h4 class="player-username">{{ player.userName }}</h4>
        <p v-if="player.isHost" class="host-text">Host</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Lobby",
  props: {
    players: { type: Array, required: false, default: [] },
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
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 4px 10px #00000080;
  padding: 30px;
  max-height: 400px;
  overflow-y: auto;
}
.player-username {
  color: rgb(3, 2, 19);
  font-size: 25px;
  font-weight: bold;
}
.host-text {
  font-size: 12px;
  margin-left: 30px;
}
</style>
