function getLast2Digits(numbers) {
    return numbers.map(n => String(n).slice(-2));
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

    // ❗ tránh duplicate ngày
    if (data.some(x => x.date === todayStr)) return;

    const last2 = getLast2Digits(xsmbNumbers);

    data.push({
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

        const nextDay = getNextDate(item.date);

        const result = xsmbData.find(x => x.date === nextDay);

        if (!result) continue;

        // ❗ giả sử key là "special"
        const special = String(result.special).slice(-2);

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

module.exports = { getLast2Digits, getNextDate, saveCalculator, updateCalculator, statsCalculator };