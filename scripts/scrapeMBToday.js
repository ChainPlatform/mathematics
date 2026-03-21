const axios = require('axios');
const cheerio = require('cheerio');

// =======================
// GET NUMBERS
function getNumbers($, row) {
    if (!row || row.length === 0) return [];

    return row.find('.giaiSo, div')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(x => /^\d+$/.test(x)); // chỉ lấy số
}

// =======================
// FETCH THEO NGÀY
async function fetchDrawByDate(slug) {
    const url = `https://www.minhngoc.net.vn/ket-qua-xo-so/mien-bac/${slug}.html`;

    const res = await axios.get(url, { timeout: 10000 });
    const html = res.data;

    if (!html.includes('bkqmienbac')) {
        throw new Error("Invalid page / no data");
    }

    const $ = cheerio.load(html);

    let targetBlock = null;

    $('.box_kqxs').each((_, el) => {
        const b = $(el);

        const titleText = b.find('.title a').last().text().trim();

        const match = titleText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!match) return;

        const date = `${match[1]}-${match[2]}-${match[3]}`;

        if (date === slug) {
            targetBlock = b;
        }
    });

    if (!targetBlock) {
        throw new Error("No matching block");
    }

    const table = targetBlock.find('.bkqtinhmienbac');

    if (!table.length) {
        throw new Error("No table");
    }

    return {
        date: slug,
        region: "mien_bac",
        prizes: {
            giaidb: getNumbers($, table.find('.giaidb')),
            giai1: getNumbers($, table.find('.giai1')),
            giai2: getNumbers($, table.find('.giai2')),
            giai3: getNumbers($, table.find('.giai3')),
            giai4: getNumbers($, table.find('.giai4')),
            giai5: getNumbers($, table.find('.giai5')),
            giai6: getNumbers($, table.find('.giai6')),
            giai7: getNumbers($, table.find('.giai7')),
        }
    };
}

// =======================
// RUN CLI
async function scrapeToday() {
    const today = new Date();
    const slug = slugFromDate(today);
    return await fetchDrawByDate(slug);
}

module.exports = {
    scrapeToday,
    fetchDrawByDate,
};

// =======================
// RUN CLI
if (require.main === module) {
    module.exports()
        .then(res => {
            console.log("✅ DONE:", res);
        })
        .catch(err => {
            console.error("❌ ERROR:", err.message);
        });
}