<template>
  <div class="lobby-container">
    <ul v-for="player in players" :key="player.socket">
      <li>{{ player.userName }}</li>
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
.lobby-container {
  width: 50%;
  height: 60%;
  background-color: darkgray;
}
</style>
