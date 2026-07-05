import { BadgeDollarSign, Package, TriangleAlert, Workflow, ArrowUpRight } from 'lucide-react';
import { formatMoney, formatPercent, formatNumber } from '../utils/superstore';

const InsightChip = ({ icon: Icon, label, value, note, tone }) => (
  <div className={`insight-chip insight-chip--${tone}`}>
    <Icon size={16} />
    <div>
      <strong>{label}</strong>
      <span>{value}</span>
      <small>{note}</small>
    </div>
  </div>
);

export default function InsightRail({ summary, insights }) {
  const topYear = summary.yearly.reduce((best, item) => (item.Sales > best.Sales ? item : best), summary.yearly[0]);
  const topRegion = summary.region.reduce((best, item) => (item.Sales > best.Sales ? item : best), summary.region[0]);
  const topCategory = summary.category.reduce((best, item) => (item.Profit > best.Profit ? item : best), summary.category[0]);
  const lowestSub = summary.subCategoryProfit[0];

  return (
    <aside className="insight-rail">
      <div className="insight-rail__hero">
        <img src="/superstore-hero.svg" alt="Abstract dashboard illustration with cart, boxes and charts" />
        <div>
          <p className="eyebrow">Superstore intelligence</p>
          <h2>What stands out first</h2>
          <p>These signals stay fixed so you can keep the story of the business in view while filtering the charts.</p>
        </div>
      </div>

      <div className="insight-rail__cards">
        <InsightChip icon={BadgeDollarSign} label="Total Sales" value={formatMoney(summary.overall.sales)} note="Across the full workbook" tone="mint" />
        <InsightChip icon={ArrowUpRight} label="Profit Margin" value={formatPercent(summary.overall.profitMargin / 100)} note="Net margin over sales" tone="sand" />
        <InsightChip icon={Package} label="Orders" value={formatNumber(summary.overall.orders)} note={`${formatNumber(summary.overall.returnOrders)} returned orders`} tone="coral" />
        <InsightChip icon={TriangleAlert} label="Watchlist" value={lowestSub.subCategory} note={`Lowest profit sub-category at ${formatMoney(lowestSub.Profit)}`} tone="rose" />
      </div>

      <div className="insight-rail__story">
        <h3>Dataset Story</h3>
        <ul>
          {insights.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="insight-rail__footer">
        <Workflow size={16} />
        <div>
          <strong>{topYear.Year} was the peak year</strong>
          <span>{formatMoney(topYear.Sales)} in sales with {formatMoney(topRegion.Sales)} from {topRegion.Region}.</span>
        </div>
      </div>
    </aside>
  );
}
