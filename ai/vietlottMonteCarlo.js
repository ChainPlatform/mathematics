function weightedPick(arr) {
    const total = arr.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;

    for (let i = 1; i < arr.length; i++) {
        r -= arr[i];
        if (r <= 0) return i;
    }

    return arr.length - 1;
}

// =======================
function monteCarloVietlott(model, runs = 50000) {
    const results = {};

    for (let k = 0; k < runs; k++) {
        const picked = new Set();

        while (picked.size < 6) {
            picked.add(weightedPick(model.freq));
        }

        const key = Array.from(picked).sort((a, b) => a - b).join("-");

        results[key] = (results[key] || 0) + 1;
    }

    return Object.entries(results)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(x => x[0]);
}

module.exports = { monteCarloVietlott };