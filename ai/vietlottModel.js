function buildVietlottModel(data, type = "6x55") {
    const max = type === "6x55" ? 55 : 45;

    const freq = Array(max + 1).fill(1);
    const lastSeen = Array(max + 1).fill(0);

    data.forEach((item, idx) => {
        item.numbers.forEach(n => {
            const num = Number(n);
            freq[num]++;
            lastSeen[num] = idx;
        });
    });

    const total = data.length;

    return { freq, lastSeen, total, max };
}

// =======================
function scoreNumber(n, model) {
    const freq = model.freq[n] / model.total;
    const recency = (model.total - model.lastSeen[n]) / model.total;

    return 0.6 * freq + 0.4 * recency;
}

module.exports = {
    buildVietlottModel,
    scoreNumber
};