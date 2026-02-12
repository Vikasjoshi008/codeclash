const calculateElo = (winnerElo, loserElo, k = 32) => {
  const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLose = 1 - expectedWin;

  return {
    winnerNew: Math.round(winnerElo + k * (1 - expectedWin)),
    loserNew: Math.round(loserElo + k * (0 - expectedLose))
  };
}

module.exports = calculateElo;