// scripts/scrape645Today.js
const axios = require('axios');
const cheerio = require('cheerio');

// =======================
function slugFromDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

// =======================
// DATE
function extractDate($) {
  const text = $('h4').text();
  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

// =======================
// KỲ VÉ
function extractKyVe($) {
  const text = $('body').text();
  const match = text.match(/Kỳ\s*vé[:\s]*(\d+)/i);
  return match ? match[1] : null;
}

// =======================
// MONEY
function parseMoney(text) {
  const match = text.match(/[\d,]+/);
  return match ? Number(match[0].replace(/,/g, '')) : 0;
}

// =======================
// PRIZE (MEGA)
function parsePrize($, label, idPrefix) {
  const row = $(`td.giai_thuong_text:contains("${label}")`).closest('tr');

  const count = parseInt(
    row.find(`td[id^="${idPrefix}"]`).text().trim().replace(/,/g, '') || '0',
    10
  );

  const raw = row.find('td.giai_thuong_gia_tri b').text().trim();

  return {
    count,
    amount: parseMoney(raw)
  };
}

// =======================
// FETCH
async function fetchDrawByDate(slug) {
  const url = `https://www.minhngoc.net.vn/ket-qua-xo-so/dien-toan-vietlott/mega-6x45/${slug}.html`;

  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  // 🔥 numbers
  const numbers = $('ul.result-number li div.bool')
    .map((_, el) => $(el).text().trim())
    .get();

  if (numbers.length < 6) {
    throw new Error("No numbers");
  }

  // 🔥 date + kỳ vé
  const realDate = extractDate($);
  const kyVe = extractKyVe($);

  return {
    date: realDate || slug,
    ky_ve: kyVe,
    numbers: numbers.slice(0, 6), // ❗ không có bonus
    prizes: {
      jackpot: parsePrize($, 'Jackpot', 'DT6X45_S_JACKPOT'),
      giai_nhat: parsePrize($, 'Giải nhất', 'DT6X45_S_G1'),
      giai_nhi: parsePrize($, 'Giải nhì', 'DT6X45_S_G2'),
      giai_ba: parsePrize($, 'Giải ba', 'DT6X45_S_G3'),
    }
  };
}

// =======================
async function scrapeToday() {
  const slug = slugFromDate(new Date());
  return await fetchDrawByDate(slug);
}

module.exports = {
  scrapeToday,
  fetchDrawByDate,
};

// =======================
if (require.main === module) {
  scrapeToday()
    .then(res => console.log("✅ DONE:", res))
    .catch(err => console.error("❌ ERROR:", err.message));
}