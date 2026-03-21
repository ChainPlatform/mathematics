const { scoreDigit } = require("./coreModel");

// =======================
// ENTROPY
function entropyScore(num) {
  const unique = new Set(num).size;
  if (unique <= 3) return 0.5;
  if (unique === 4) return 0.8;
  return 1;
}

// =======================
// PATTERN
function patternScore(num) {
  const digits = num.split("").map(Number);

  const sum = digits.reduce((a, b) => a + b, 0);
  const even = digits.filter(x => x % 2 === 0).length;

  let score = 1;

  if (sum < 15 || sum > 45) score *= 0.7;
  if (even < 2 || even > 4) score *= 0.8;

  return score;
}

// =======================
// GENERATE 1 NUMBER
function generateOne(model) {
  let num = "";

  for (let i = 0; i < 6; i++) {
    let best = 0;
    let bestScore = -1;

    for (let d = 0; d <= 9; d++) {
      const s = scoreDigit(d, i, model);
      if (s > bestScore) {
        bestScore = s;
        best = d;
      }
    }

    num += best;
  }

  return num;
}

// =======================
// SCORE NUMBER
function scoreNumber(num, model) {
  const digits = num.split("").map(Number);

  let s = 0;
  for (let i = 0; i < 6; i++) {
    s += scoreDigit(digits[i], i, model);
  }

  return s * entropyScore(num) * patternScore(num);
}

// =======================
// GENERATE + RANK
function rankNumbers(model, n = 1000) {
  const set = new Set();

  while (set.size < n) {
    set.add(generateOne(model));
  }

  return [...set]
    .map(n => ({ number: n, score: scoreNumber(n, model) }))
    .sort((a, b) => b.score - a.score);
}

module.exports = { rankNumbers };