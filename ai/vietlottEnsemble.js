const { buildVietlottModel } = require("./vietlottModel");
const { generateMany } = require("./vietlottGenerator");
const { monteCarloVietlott } = require("./vietlottMonteCarlo");

const cache = new Map();

function vietlottEnsemble(data, type = "6x55", total = 5) {
    const key = type + "_" + data.length;

    if (cache.has(key)) return cache.get(key);

    const model = buildVietlottModel(data, type);

    const gen = generateMany(model, 2000);
    const MC_RUNS = process.env.FAST ? 1000 : 5000;
    const mc = monteCarloVietlott(model, MC_RUNS);

    const score = {};

    gen.forEach((n, i) => {
        score[n] = (score[n] || 0) + (20 - i);
    });

    mc.forEach((n, i) => {
        score[n] = (score[n] || 0) + (15 - i);
    });

    const result = Object.entries(score)
        .sort((a, b) => b[1] - a[1])
        .slice(0, total)
        .map(x => x[0])

    cache.set(key, result);

    return result;
}

module.exports = { vietlottEnsemble };