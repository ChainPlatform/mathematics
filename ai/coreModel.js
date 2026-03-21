const { bayesian } = require("./bayesian");

function buildModel(data, provinceId) {
  const posFreq = Array.from({ length: 6 }, () => Array(10).fill(1));
  const lastSeen = Array.from({ length: 6 }, () => Array(10).fill(0));

  const filtered = data.filter(x => x.province_id === provinceId);

  filtered.forEach((item, idx) => {
    const s = item.prizes.giaidb?.[0];
    if (!s) return;

    s.split("").map(Number).forEach((d, i) => {
      posFreq[i][d]++;
      lastSeen[i][d] = idx;
    });
  });

  const total = filtered.length || 1;

  const bayes = bayesian(provinceId, data);

  return { posFreq, lastSeen, total, bayes };
}

function scoreDigit(d, i, model) {
  const freq = model.posFreq[i][d] / model.total;
  const recency = (model.total - model.lastSeen[i][d]) / model.total;
  const bayes = model.bayes[i][d];

  return (
    0.4 * bayes +
    0.35 * freq +
    0.25 * recency
  );
}

module.exports = { buildModel, scoreDigit };