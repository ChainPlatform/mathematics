const fs = require('fs-extra');

// ===== IMPORT AI MODULES =====
const { ensemble } = require('./ai/ensemble');
const { vietlottEnsemble } = require('./ai/vietlottEnsemble');

// =======================
// FORMAT DATE
function today() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

// =======================
// LOAD DATA
async function load(file) {
    try {
        return await fs.readJson(file);
    } catch {
        return [];
    }
}

// =======================
// GROUP BY PROVINCE
function groupByProvince(data) {
    const map = {};

    (data || []).forEach(item => {
        if (!map[item.province_id]) {
            map[item.province_id] = [];
        }
        map[item.province_id].push(item);
    });

    return map;
}

// =======================
// 🎯 XSMN / XSMT
async function predictMultiProvince(file) {
    const data = await load(file);

    const grouped = groupByProvince(data);

    const result = {};

    for (const province in grouped) {
        const history = grouped[province];

        const picks = ensemble(province, history);

        result[province] = picks.slice(0, 3);
    }

    return result;
}

// =======================
// 🎯 XSMB
async function predictXSMB() {
    const data = await load('./results/xsmb.json');

    if (!data.length) return null;

    const infos = ensemble("mien_bac", data, 5).slice(0, 20);

    return infos;
}

// =======================
// 🎯 Vietlott
async function predictVietlott(file, type) {
    const data = await load(file);

    return vietlottEnsemble(data, type, 3);
}

// =======================
// 🚀 MAIN GENERATOR
async function runGenerator() {
    // console.log("🧠 AI GENERATOR RUNNING...\n");

    // ===== LOAD ALL DATA =====
    const xsmnData = await load('./results/xsmn.json');
    const xsmtData = await load('./results/xsmt.json');
    const xsmbData = await load('./results/xsmb.json');
    const p655Data = await load('./results/power6x55.json');
    const m645Data = await load('./results/power6x45.json');

    await updateCalculator(xsmbData);

    const todayStr = today()

    const output = {
        date: todayStr,
    };

    if (hasTodayData(xsmnData)) {
        output.xsmn = await predictMultiProvince('./results/xsmn.json');
    }

    if (hasTodayData(xsmtData)) {
        output.xsmt = await predictMultiProvince('./results/xsmt.json');
    }

    if (hasTodayData(xsmbData)) {
        output.xsmb = await predictXSMB();

        await saveCalculator(todayStr, output.xsmb);
        const stats = await statsCalculator();
        console.log("📊 STATS:", stats);
    }

    if (hasTodayData(p655Data)) {
        output.power655 = await predictVietlott('./results/power6x55.json', '6x55');
    }

    if (hasTodayData(m645Data)) {
        output.mega645 = await predictVietlott('./results/power6x45.json', '6x45');
    }

    // const output = {
    //     date: today(),

    //     // ===== XỔ SỐ =====
    //     xsmn: await predictMultiProvince('./results/xsmn.json'),
    //     xsmt: await predictMultiProvince('./results/xsmt.json'),
    //     xsmb: await predictXSMB(),

    //     // ===== VIETLOTT =====
    //     power655: await predictVietlott('./results/power6x55.json', '6x55'),
    //     mega645: await predictVietlott('./results/power6x45.json', '6x45')
    // };

    // await fs.writeJson('./results/ai_prediction.json', output, { spaces: 2 });

    if (!output || typeof output !== 'object') {
        throw new Error("Invalid AI output");
    }
    await fs.writeJson('./ai_output.json', output, { spaces: 2 });

    // console.log("DONE AI PREDICTION\n");
    // console.log(JSON.stringify(output, null, 2));
    // console.log(JSON.stringify(output));
    console.log("DONE AI PREDICTION");

    return output;
}

function hasTodayData(data) {
    const t = today();
    return (data || []).some(x => x.date === t);
}

// =======================
module.exports = { runGenerator };

// =======================
// RUN CLI
if (require.main === module) {
    runGenerator();
}