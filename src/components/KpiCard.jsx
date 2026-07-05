import { TrendingUp } from 'lucide-react';
import { formatMoney, formatNumber, formatPercent } from '../utils/superstore';

export default function KpiCard({ label, value, hint, tone = 'mint' }) {
  const formatted =
    label === 'Sales' || label === 'Profit'
      ? formatMoney(value)
      : label === 'Profit Margin'
        ? formatPercent(value / 100)
        : formatNumber(value);

  return (
    <article className={`kpi-card kpi-card--${tone}`} title={hint}>
      <div className="kpi-card__icon">
        <TrendingUp size={16} />
      </div>
      <div className="kpi-card__copy">
        <span>{label}</span>
        <strong>{formatted}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}
