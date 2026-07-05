# Sample-Superstore-Dashboard

Interactive React dashboard built from the Sample Superstore workbook.

## What is included

- 4 KPI cards
- 5 zoomable charts
- Filters for year, region, category, segment, and ship mode
- Static insight rail with workbook-wide observations
- Custom tooltips with sales, profit, order, discount, and return context

## Structure

- `src/App.jsx` - dashboard composition and data flow
- `src/components/` - reusable UI blocks
- `src/utils/superstore.js` - data aggregation and formatting helpers
- `src/data/` - workbook-derived JSON data
- `public/superstore-hero.svg` - header illustration

## Run locally

```bash
pnpm install
pnpm dev
```

Then open the local URL shown by Vite.
