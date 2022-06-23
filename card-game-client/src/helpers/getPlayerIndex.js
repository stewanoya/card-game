const getPlayerIndex = (state, username) => {
  let index;
  state.gameData.players.find((player, i) => {
    if (player.userName == username) {
      index = i;
    }
  });
  return index;
};

module.exports = { getPlayerIndex };
