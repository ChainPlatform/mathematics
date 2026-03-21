const fs = require("fs-extra");

function getDigits(num) {
    return num.split("").map(Number);
}

function bayesian(provinceId, data) {
    const filtered = data.filter(x => x.province_id === provinceId);

    const alpha = Array.from({ length: 6 }, () => Array(10).fill(1));

    filtered.forEach((item, idx) => {
        const weight = 1 + idx / filtered.length;

        const special = item.prizes.giaidb?.[0];
        if (!special) return;

        const digits = getDigits(special);

        digits.forEach((d, i) => {
            alpha[i][d] += weight;
        });
    });

    return alpha.map(arr => {
        const sum = arr.reduce((a, b) => a + b, 0);
        return arr.map(x => x / sum);
    });
}

module.exports = { bayesian };