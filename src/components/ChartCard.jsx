import { Maximize2, Minimize2 } from 'lucide-react';

export default function ChartCard({ id, title, subtitle, icon: Icon, expanded, onToggleZoom, children, className = '' }) {
  return (
    <section className={`chart-card ${expanded ? 'chart-card--expanded' : ''} ${className}`}>
      <header className="chart-card__header">
        <div className="chart-card__title">
          <span className="chart-card__icon"><Icon size={18} /></span>
          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>
        <button className="zoom-button" type="button" onClick={() => onToggleZoom(id)} aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}>
          {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </header>
      <div className="chart-card__body">{children}</div>
    </section>
  );
}
