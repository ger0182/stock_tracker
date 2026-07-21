import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname, '..');
const stocksPath = path.join(root, 'data', 'stocks.json');
const pricesPath = path.join(root, 'data', 'prices.json');

const stocks = JSON.parse(await fs.readFile(stocksPath, 'utf8'));
let previous = { quotes: {} };
try {
  previous = JSON.parse(await fs.readFile(pricesPath, 'utf8'));
} catch {}

const symbols = stocks.map((s) => s.symbol).join(',');
const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

function taipeiISO(epochSeconds) {
  const d = epochSeconds ? new Date(epochSeconds * 1000) : new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).formatToParts(d).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}

const response = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 stock-tracker/1.0',
    'Accept': 'application/json'
  }
});

if (!response.ok) {
  throw new Error(`Yahoo Finance quote request failed: ${response.status} ${response.statusText}`);
}

const data = await response.json();
const results = data?.quoteResponse?.result ?? [];
const bySymbol = new Map(results.map((q) => [q.symbol, q]));

const quotes = {};
for (const stock of stocks) {
  const q = bySymbol.get(stock.symbol);
  const prior = previous.quotes?.[stock.code] ?? {};
  quotes[stock.code] = {
    symbol: stock.symbol,
    price: q?.regularMarketPrice ?? prior.price ?? null,
    previousClose: q?.regularMarketPreviousClose ?? prior.previousClose ?? null,
    change: q?.regularMarketChange ?? null,
    changePercent: q?.regularMarketChangePercent ?? null,
    marketTime: q?.regularMarketTime ? taipeiISO(q.regularMarketTime) : prior.marketTime ?? null,
    marketState: q?.marketState ?? null,
    currency: q?.currency ?? 'TWD',
    sourceName: q?.shortName ?? q?.longName ?? stock.name,
    updatedByScript: taipeiISO()
  };
}

const output = {
  lastUpdated: taipeiISO(),
  timezone: 'Asia/Taipei',
  source: 'Yahoo Finance quote API（GitHub Actions 每個交易日 14:00 執行）',
  quotes
};

await fs.writeFile(pricesPath, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`Updated ${Object.keys(quotes).length} quotes at ${output.lastUpdated}`);
