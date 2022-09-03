<template>
  <div class="district-card">
    <div class="district-header">
      <div class="gold-coin-container">
        <!-- We hide the cost, but still need to assess the cost before playing -->
        <div class="gold-coin" v-for="index in costAsNumber" :key="index"></div>
        <div class="hidden-cost">{{ cost }}</div>
      </div>
      <h5 class="ward-name">{{ name }}</h5>
    </div>
    <div class="card-body">
      <div class="card-type" :class="type"></div>
      <!-- hidden for the same reason as cost -->
      <p class="hidden-type">{{ type }}</p>
    </div>
    <n-tooltip
      class="unique-description"
      trigger="click"
      style="width: 300px"
      v-if="uniqueDescription"
    >
      <template #trigger class="unique-description">
        <n-button class="info-button" type="info" round size="tiny">
          i
        </n-button>
      </template>
      {{ uniqueDescription }}
    </n-tooltip>
  </div>
</template>

<script setup>
import { NTooltip, NButton } from "naive-ui";
</script>
<script>
export default {
  components: {
    NTooltip,
    NButton,
  },
  props: {
    name: { type: String, required: true },
    cost: { type: String, required: true },
    type: { type: String, required: true },
    uniqueDescription: { type: String, required: false },
  },
  computed: {
    costAsNumber() {
      return Number(this.cost);
    },
  },
};
</script>

<style scoped>
.district-card {
  position: relative;
  background-color: #fffef1;
  margin-inline: 5px;
  padding-inline: 20px;
  height: 100px;
  max-width: 100px;
  min-width: 75px;
  width: 12%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 3px solid rgb(1, 1, 8);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.25);
  cursor: grab;
  z-index: 2;
}

.card-body {
  min-height: 30px;
}

.district-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: end;
}

.unique-description {
  font-size: 11px;
  text-align: left;
  width: 100px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 75px;
  padding: 5px;
  background-color: #e4e4e4;
  z-index: 2;
}

.gold-coin-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 10px;
  left: 5px;
  height: 100%;
}

.gold-coin {
  min-width: 15px;
  min-height: 15px;
  border-radius: 100%;
  background-color: #f2ea29;
  border: 1px solid #bd9401;
  margin-top: -5px;
}
.hidden-cost {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.hidden-type {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.ward-name {
  position: absolute;
  top: 2px;
  right: 5px;
  font-size: 14px;
}

.card-type {
  position: absolute;
  width: 200px;
  height: 25px;
  bottom: 30px;
  left: 10px;
  transform: rotate(-35deg);
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.25);
}

.red {
  background-color: red;
}

.green {
  background-color: green;
}

.blue {
  background-color: blue;
}

.yellow {
  background-color: yellow;
}

.purple {
  background-color: purple;
}

.info-button {
  border-radius: 10px;
  position: absolute;
  top: 60%;
  font-size: 12px;
  z-index: 1000;
}
.n-popover__content {
  max-width: 200px !important;
}
</style>
