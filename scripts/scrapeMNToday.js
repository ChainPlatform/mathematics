// scripts/scrapeMNToday.js
const axios = require('axios');
const cheerio = require('cheerio');

// =======================
// NORMALIZE TÊN TỈNH
function normalize(str) {
    return str
        .toLowerCase()
        .replace(/\s+/g, '_')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// =======================
// EXTRACT MÃ TỈNH
function extractCode(text) {
    if (!text) return null;
    return text.split(' - ')[0].trim();
}

// =======================
// GET NUMBERS (safe)
function getNumbers($, row) {
    if (!row || row.length === 0) return [];

    return row.find('div')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(x => x); // remove rỗng
}

// =======================
// PARSE 1 TỈNH (safe)
function parseProvince($, table) {
    const el = $(table);

    const province = el.find('.tinh a').text().trim();
    if (!province) return null;

    const province_id = normalize(province);
    const code = extractCode(el.find('.matinh').text().trim());

    const prizes = {
        giai8: getNumbers($, el.find('.giai8')),
        giai7: getNumbers($, el.find('.giai7')),
        giai6: getNumbers($, el.find('.giai6')),
        giai5: getNumbers($, el.find('.giai5')),
        giai4: getNumbers($, el.find('.giai4')),
        giai3: getNumbers($, el.find('.giai3')),
        giai2: getNumbers($, el.find('.giai2')),
        giai1: getNumbers($, el.find('.giai1')),
        giaidb: getNumbers($, el.find('.giaidb')),
    };

    return {
        province,
        province_id,
        code,
        prizes
    };
}

// =======================
// FETCH THEO NGÀY
async function fetchDrawByDate(slug) {
    const url = `https://www.minhngoc.net.vn/ket-qua-xo-so/mien-nam/${slug}.html`;

    let res;
    try {
        res = await axios.get(url, { timeout: 10000 });
    } catch (err) {
        throw new Error("Fetch fail");
    }

    const html = res.data;

    if (!html.includes('bkqmiennam')) {
        throw new Error("Invalid page / no data");
    }

    const $ = cheerio.load(html);

    const results = [];

    // 🔥 LOOP THEO TỪNG NGÀY (box_kqxs)
    $('.box_kqxs').each((_, box) => {

        const block = $(box);

        // 👉 lấy ngày trong block này
        const titleText = block.find('.title a').last().text().trim();

        const match = titleText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!match) return;

        const date = `${match[1]}-${match[2]}-${match[3]}`;

        // 👉 chỉ lấy đúng ngày cần
        if (date !== slug) return;

        // 👉 parse các tỉnh trong block này
        block.find('.rightcl').each((_, table) => {
            const data = parseProvince($, table);

            if (data) {
                results.push({
                    date,
                    ...data
                });
            }
        });
    });

    if (results.length === 0) {
        throw new Error("No province parsed");
    }

    return results;
}

function slugFromDate(d) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getFullYear()}`;
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