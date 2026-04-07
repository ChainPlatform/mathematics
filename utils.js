const fs = require('fs-extra');

async function load(file) {
    try {
        return await fs.readJson(file);
    } catch {
        return [];
    }
}

function getLast2Digits(numbers) {
    const result = [];

    numbers.forEach(n => {
        const last2 = String(n).slice(-2).padStart(2, "0");

        if (!result.includes(last2)) {
            result.push(last2);
        }
    });

    return result;
}

function getNextDate(dateStr) {
    const [d, m, y] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);

    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

async function saveCalculator(todayStr, xsmbNumbers) {
    const file = './results/calculators.json';

    let data = [];
    try {
        data = await fs.readJson(file);
    } catch { }

    if (data.some(x => x.date === todayStr)) return;

    const last2 = getLast2Digits(xsmbNumbers);

    data.unshift({
        date: todayStr,
        numbers: last2,
        result: null,
        status: null
    });

    await fs.writeJson(file, data, { spaces: 2 });
}

async function updateCalculator(xsmbData) {
    const file = './results/calculators.json';

    let data = [];
    try {
        data = await fs.readJson(file);
    } catch { }

    let changed = false;

    for (let item of data) {
        if (item.status) continue;

        const result = xsmbData.find(x => x.date === item.date);
        if (!result) continue;

        const special = String(result.prizes?.giaidb?.[0] || "").slice(-2);

        item.result = special;
        item.status = item.numbers.includes(special) ? "win" : "lose";

        changed = true;
    }

    if (changed) {
        await fs.writeJson(file, data, { spaces: 2 });
    }
}

async function statsCalculator() {
    const data = await load('./results/calculators.json');

    const total = data.length;
    const win = data.filter(x => x.status === "win").length;
    const lose = data.filter(x => x.status === "lose").length;

    return {
        total,
        win,
        lose,
        rate: total ? ((win / total) * 100).toFixed(2) + "%" : "0%"
    };
}

module.exports = { load, getLast2Digits, getNextDate, saveCalculator, updateCalculator, statsCalculator };