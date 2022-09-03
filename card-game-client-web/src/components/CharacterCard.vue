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
  justify-content: space-around;
  width: 20%;
  height: 35%;
  max-height: 200px;
  max-width: 150px;
  background-color: #452059;
  border: 1px solid #380256;
  margin-inline: 10px;
  min-height: 150px;
  min-width: 100px;
  color: white;
  padding-inline: 15px;
  transition: all 0.25s ease-in-out;
}

.card-container:hover {
  box-shadow: 0px 13px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transform: translateY(-10px);
  transition: all 0.4s ease-in-out;
  color: #b374d4;
}

.header {
  font-size: 20px;
  font-weight: 600;
}

.body {
  font-size: 12px;
}

.footer {
  font-weight: 600;
  background-color: #5b2975;
  padding: 10px 5px;
  border-radius: 10px;
}
</style>
