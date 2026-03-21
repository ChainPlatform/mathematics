function weightedPick(prob) {
    const r = Math.random();
    let acc = 0;

    for (let i = 0; i < prob.length; i++) {
        acc += prob[i];
        if (r <= acc) return i;
    }

    return 9;
}

// =======================
function monteCarlo(model, runs = 50000) {
    const results = {};

    for (let k = 0; k < runs; k++) {
        let num = "";

        for (let i = 0; i < 6; i++) {
            num += weightedPick(model.bayes[i]);
        }

        results[num] = (results[num] || 0) + 1;
    }

    return Object.entries(results)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([num]) => num);
}

module.exports = { monteCarlo };