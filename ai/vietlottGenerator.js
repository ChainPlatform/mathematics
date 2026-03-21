const { scoreNumber } = require("./vietlottModel");

// =======================
function generateSet(model) {
    const nums = [];

    while (nums.length < 6) {
        let best = null;
        let bestScore = -1;

        for (let n = 1; n <= model.max; n++) {
            if (nums.includes(n)) continue;

            const s = scoreNumber(n, model);

            if (s > bestScore) {
                best = n;
                bestScore = s;
            }
        }

        nums.push(best);
    }

    return nums.sort((a, b) => a - b);
}

// =======================
function generateMany(model, count = 2000) {
    const results = {};

    for (let i = 0; i < count; i++) {
        const set = generateSet(model).join("-");

        results[set] = (results[set] || 0) + 1;
    }

    return Object.entries(results)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(x => x[0]);
}

module.exports = {
    generateMany
};