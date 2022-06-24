<template></template>

<script>
import Opponent from "./Opponent.vue";
export default {
  props: {
    opponents: { type: Array, required: true },
  },
  name: "OpponentsContainer",
  components: {
    Opponent,
  },
};
</script>

<style></style>
