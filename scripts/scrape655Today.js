// scripts/scrape655Today.js
const axios = require('axios');
const cheerio = require('cheerio');

function slugFromDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

// =======================
// ✅ EXTRACT DATE (TỪ <a>)
function extractDate($) {
  const text = $('a:contains("NGÀY")').text();

  const match = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);

  if (!match) return null;

  return `${match[1]}-${match[2]}-${match[3]}`;
}

// =======================
// ✅ EXTRACT KY VE
function extractKyVe($) {
  const text = $('body').text();

  const match = text.match(/Kỳ\s*vé[:\s]*#?(\d+)/i);

  return match ? match[1] : null;
}

// =======================
// ✅ PARSE MONEY
function parseMoney(text) {
  const match = text.match(/[\d,]+đ/);

  return match
    ? Number(match[0].replace(/[^\d]/g, ''))
    : 0;
}

// =======================
// ✅ PARSE PRIZE
function parsePrize($, label) {
  const row = $(`td.giai_thuong_text:contains("${label}")`).closest('tr');

  const count = parseInt(
    row.find('td[id^="DT6X55_S"]').text().trim().replace(/,/g, ''),
    10
  );

  const raw = row.find('td.giai_thuong_gia_tri b').text().trim();

  return {
    count,
    amount: parseMoney(raw)
  };
}

// =======================
// 🚀 MAIN FETCH
async function fetchDrawByDate(slug) {
  const url = `https://www.minhngoc.net.vn/ket-qua-xo-so/dien-toan-vietlott/power-6x55/${slug}.html`;

  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  const raw = $('ul.result-number li div.bool')
    .map((_, el) => $(el).text().trim())
    .get();

  if (raw.length < 7) throw new Error('No valid numbers');

  // ✅ LẤY DATE THẬT
  const realDate = extractDate($);

  // ✅ LẤY KỲ VÉ
  const kyVe = extractKyVe($);

  const vl = {
    date: realDate || slug,
    ky_ve: kyVe,
    numbers: raw.slice(0, 6),
    bonus: raw[6],
    prizes: {
      jackpot1: parsePrize($, 'Jackpot 1'),
      jackpot2: parsePrize($, 'Jackpot 2'),
      giai_nhat: parsePrize($, 'Giải nhất'),
      giai_nhi: parsePrize($, 'Giải nhì'),
      giai_ba: parsePrize($, 'Giải ba'),
    }
  };

  return vl;
}

// =======================
// EXPORT
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