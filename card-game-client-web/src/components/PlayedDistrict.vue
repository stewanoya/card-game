<template>
  <div class="district-card">
    <div class="district-header">
      <p class="cost">{{ cost }}</p>
      <p class="type">{{ type }}</p>
    </div>
    <div class="card-body">
      <p class="unique-description" v-if="uniqueDescription">
        {{ uniqueDescription }}
      </p>
    </div>
    <p class="name">{{ name }}</p>
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
  height: 10%;
  background-color: rgb(230, 230, 230);
  margin-inline: 5px;
  padding-inline: 5px;
  min-height: 50px;
  max-width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 2px solid black;
  border-radius: 10px;
}

.card-body {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 50px;
  min-height: 0px;
}

.district-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  height: 15px;
}

.unique-description {
  font-size: 11px;
  text-align: left;
}

.type {
  font-size: 8px;
}

.name {
  font-size: 8px;
}

.cost {
  font-size: 8px;
}
</style>
