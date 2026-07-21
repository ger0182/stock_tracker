# 2027 EPS 股票追蹤網頁

這是一個靜態網頁，用來追蹤指定台股的最新股價、2027 預估 EPS、2027 Forward PE、推估合理價與潛在空間。

## 功能

- 追蹤 17 檔股票。
- 讀取 `data/prices.json` 顯示最新股價。
- 自動計算 2027 Forward PE、推估合理價、潛在空間。
- GitHub Actions 每週一至週五台灣時間 14:00 更新股價。
- 每次 push 到 `main` 會自動部署到 GitHub Pages。

## 檔案

- `index.html`：主網頁，包含畫面與估值計算。
- `data/stocks.json`：股票清單、2027 EPS、合理 PE 區間。
- `data/prices.json`：最新股價資料。
- `scripts/update-prices.mjs`：抓 Yahoo Finance 報價並更新 `prices.json`。
- `.github/workflows/update-prices.yml`：每日 14:00 更新股價並部署。
- `.github/workflows/deploy-pages.yml`：push 後部署 GitHub Pages。

## 本機預覽

```bash
python -m http.server 8080
```

開啟：

```text
http://localhost:8080
```

## 注意

- Yahoo Finance quote API 是非官方資料來源，日後若介面變動，可能需要調整 `scripts/update-prices.mjs`。
- GitHub Actions 排程可能比 14:00 晚幾分鐘執行。
- 此工具只做估值追蹤，不構成投資建議。
