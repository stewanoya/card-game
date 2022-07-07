<template>
  <div class="card-container">
    <div class="header">
      {{ value }}
    </div>

    <div class="body">
      {{ jobDescription }}
    </div>

    <div class="footer">
      {{ name }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: { type: String, required: true },
    value: { type: Number, required: true },
    jobDescription: { type: String, required: true },
  },
};
</script>

<style>
.card-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 20%;
  height: 35%;
  background-color: chartreuse;
  border: 1px solid gray;
  margin-inline: 10px;
  min-height: 150px;
  max-height: 300px;
  min-width: 100px;
  max-width: 200px;
}
</style>
