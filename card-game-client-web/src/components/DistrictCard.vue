<template>
  <div class="district-card">
    <div class="district-header">
      <p>{{ cost }}</p>
      <h5>{{ name }}</h5>
    </div>
    <div class="card-body">
      <p>{{ type }}</p>
    </div>
    <p class="unique-description" v-if="uniqueDescription">
      {{ uniqueDescription }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    name: { type: String, required: true },
    cost: { type: String, required: true },
    type: { type: String, required: true },
    uniqueDescription: { type: String, required: false },
  },
};
</script>

<style scoped>
.district-card {
  width: 15%;
  height: 12%;
  background-color: rgb(230, 230, 230);
  margin-inline: 5px;
  padding-inline: 20px;
  min-height: 150px;
  max-width: 150px;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid black;
  border-radius: 10px;
}

.card-body {
  min-height: 30px;
}

.district-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.unique-description {
  font-size: 11px;
  text-align: left;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 50px;
}
</style>
