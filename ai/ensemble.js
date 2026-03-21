const { rankNumbers } = require("./generator");
const { monteCarlo } = require("./monteCarlo");
const { buildModel } = require("./coreModel");

const cache = new Map();

function ensemble(provinceId, data, digits = 6) {
  const key = provinceId + "_" + data.length;

  if (cache.has(key)) return cache.get(key);

  const model = buildModel(data, provinceId);
  if (!model || !model.total || model.total < 30) {
    return Array.from({ length: 10 }, () =>
      String(Math.floor(Math.random() * Math.pow(10, digits)))
        .padStart(digits, '0')
    );
  }

  const ranked = rankNumbers(model, 1).slice(0, 1);
  const MC_RUNS = process.env.FAST ? 1000 : 5000;
  const mc = monteCarlo(model, MC_RUNS);

  const score = {};

  ranked.forEach((x, i) => {
    score[x.number] = (score[x.number] || 0) + (20 - i);
  });

  mc.forEach((n, i) => {
    score[n] = (score[n] || 0) + (15 - i);
  });

  const result = Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(x => x[0]);

  cache.set(key, result);

  return result;
}

module.exports = { ensemble };