import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Compass, Layers3, MapPinned, TrendingUp, ShoppingCart } from 'lucide-react';
import packData from './data/superstore-pack.json';
import summaryData from './data/superstore-summary.json';
import InsightRail from './components/InsightRail';
import FilterBar from './components/FilterBar';
import KpiCard from './components/KpiCard';
import ChartCard from './components/ChartCard';
import {
  COLORS,
  aggregateBy,
  aggregateTrend,
  applyFilters,
  formatMoney,
  formatMoney2,
  formatNumber,
  formatPercent,
  decodePack,
  getKpis,
  getTopInsights,
  uniqueValues,
} from './utils/superstore';

const chartColors = [COLORS.mint, COLORS.sand, COLORS.coral, COLORS.rose, COLORS.ink];

function moneyTick(value) {
  return `$${Math.round(value / 1000)}k`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>Sales: {formatMoney2(data.sales)}</span>
      <span>Profit: {formatMoney2(data.profit)}</span>
      <span>Orders: {formatNumber(data.orderCount)}</span>
      <span>Return rate: {formatPercent(data.returnRate / 100)}</span>
      <span>Avg. discount: {formatPercent(data.avgDiscount)}</span>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <strong>{data.label}</strong>
      <span>Sales: {formatMoney2(data.sales)}</span>
      <span>Profit: {formatMoney2(data.profit)}</span>
      <span>Profit margin: {formatPercent(data.profitMargin / 100)}</span>
      <span>Orders: {formatNumber(data.orderCount)}</span>
    </div>
  );
}

function App() {
  const [filters, setFilters] = useState({
    year: 'All',
    region: 'All',
    category: 'All',
    segment: 'All',
    shipMode: 'All',
  });
  const [zoomedChart, setZoomedChart] = useState(null);
  const rawData = useMemo(() => decodePack(packData), []);
  const summary = summaryData;

  const yearOptions = useMemo(() => ['All', ...uniqueValues(rawData, 'year')], [rawData]);
  const regionOptions = useMemo(() => ['All', ...uniqueValues(rawData, 'region')], [rawData]);
  const categoryOptions = useMemo(() => ['All', ...uniqueValues(rawData, 'category')], [rawData]);
  const segmentOptions = useMemo(() => ['All', ...uniqueValues(rawData, 'segment')], [rawData]);
  const shipModeOptions = useMemo(() => ['All', ...uniqueValues(rawData, 'shipMode')], [rawData]);

  const filteredData = useMemo(() => applyFilters(rawData, filters), [filters]);
  const kpis = useMemo(() => getKpis(filteredData), [filteredData]);
  const insights = useMemo(() => (summary ? getTopInsights(summary) : []), [summary]);

  const trendData = useMemo(() => aggregateTrend(filteredData), [filteredData]);
  const categoryData = useMemo(() => aggregateBy(filteredData, (row) => row.category), [filteredData]);
  const regionData = useMemo(() => aggregateBy(filteredData, (row) => row.region), [filteredData]);
  const subCategoryData = useMemo(
    () => aggregateBy(filteredData, (row) => row.subCategory).sort((a, b) => a.profit - b.profit),
    [filteredData],
  );
  const stateData = useMemo(() => aggregateBy(filteredData, (row) => row.state), [filteredData]);
  const topStates = useMemo(() => stateData.slice(0, 10), [stateData]);

  const ChartShell = ({ children, id, title, subtitle, icon, className = '' }) => (
    <ChartCard id={id} title={title} subtitle={subtitle} icon={icon} expanded={zoomedChart === id} onToggleZoom={(chartId) => setZoomedChart((current) => (current === chartId ? null : chartId))} className={className}>
      {children}
    </ChartCard>
  );

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Retail analytics dashboard</p>
          <h1>Superstore Dashboard</h1>
          <p>
            A clean, interactive view of the Sample Superstore workbook with filters, zoomable charts, tooltips, and static insight cues on the left.
          </p>
          <div className="hero__meta">
            <span><ShoppingCart size={14} /> {formatNumber(summary.overall.orders)} orders</span>
            <span><TrendingUp size={14} /> {formatMoney(summary.overall.sales)} sales</span>
            <span><Compass size={14} /> {formatPercent(summary.overall.profitMargin / 100)} margin</span>
          </div>
        </div>
        <div className="hero__visual">
          <img src="/superstore-hero.svg" alt="Dashboard illustration with boxes, cart and chart cards" />
        </div>
      </header>

      <div className="dashboard">
        <InsightRail summary={summary} insights={insights} />

        <main className="dashboard__main">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            yearOptions={yearOptions}
            regionOptions={regionOptions}
            categoryOptions={categoryOptions}
            segmentOptions={segmentOptions}
            shipModeOptions={shipModeOptions}
          />

          <section className="kpi-grid">
            <KpiCard label="Sales" value={kpis.sales} hint="Total revenue from the filtered rows" tone="mint" />
            <KpiCard label="Profit" value={kpis.profit} hint="Net profit after discounts and returns" tone="sand" />
            <KpiCard label="Orders" value={kpis.orderCount} hint="Unique orders currently in view" tone="coral" />
            <KpiCard label="Profit Margin" value={kpis.profitMargin} hint={`Return rate ${formatPercent(kpis.returnRate / 100)}`} tone="rose" />
          </section>

          <section className="charts-grid">
            <div className={zoomedChart && zoomedChart !== 'trend' ? 'chart-grid__dimmed' : ''}>
              <ChartShell id="trend" title="Sales Momentum" subtitle="Monthly sales and profit across the selected scope" icon={BarChart3} className="chart-card--wide">
                <ResponsiveContainer width="100%" height={zoomedChart === 'trend' ? 520 : 320}>
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,54,59,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: COLORS.ink, fontSize: 12 }} />
                    <YAxis tick={{ fill: COLORS.ink, fontSize: 12 }} tickFormatter={moneyTick} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="sales" fill={COLORS.sand} stroke={COLORS.coral} fillOpacity={0.25} name="Sales" />
                    <Line type="monotone" dataKey="profit" stroke={COLORS.ink} strokeWidth={3} dot={false} name="Profit" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>

            <div className={`chart-grid__two ${zoomedChart && zoomedChart !== 'category' ? 'chart-grid__dimmed' : ''}`}>
              <ChartShell id="category" title="Category Pulse" subtitle="Sales share by category with profit context" icon={Layers3}>
                <ResponsiveContainer width="100%" height={zoomedChart === 'category' ? 520 : 320}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="sales" nameKey="label" innerRadius={70} outerRadius={zoomedChart === 'category' ? 185 : 120} paddingAngle={4}>
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartShell>

              <ChartShell id="region" title="Regional Balance" subtitle="Sales and profit across each region" icon={BarChart3}>
                <ResponsiveContainer width="100%" height={zoomedChart === 'region' ? 520 : 320}>
                  <ComposedChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,54,59,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: COLORS.ink, fontSize: 12 }} />
                    <YAxis tick={{ fill: COLORS.ink, fontSize: 12 }} tickFormatter={moneyTick} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="sales" fill={COLORS.mint} radius={[6, 6, 0, 0]} name="Sales" />
                    <Bar dataKey="profit" fill={COLORS.rose} radius={[6, 6, 0, 0]} name="Profit" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>

            <div className={`chart-grid__two ${zoomedChart && zoomedChart !== 'subcat' ? 'chart-grid__dimmed' : ''}`}>
              <ChartShell id="subcat" title="Profitability Watchlist" subtitle="Sub-categories ranked by profit" icon={Layers3}>
                <ResponsiveContainer width="100%" height={zoomedChart === 'subcat' ? 580 : 360}>
                  <BarChart data={subCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,54,59,0.08)" />
                    <XAxis type="number" tick={{ fill: COLORS.ink, fontSize: 12 }} tickFormatter={moneyTick} />
                    <YAxis type="category" dataKey="label" width={92} tick={{ fill: COLORS.ink, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="profit" fill={COLORS.coral} radius={[0, 8, 8, 0]} name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartShell>

              <ChartShell id="states" title="State Leaders" subtitle="Top 10 states by sales performance" icon={MapPinned}>
                <ResponsiveContainer width="100%" height={zoomedChart === 'states' ? 580 : 360}>
                  <BarChart data={topStates} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,54,59,0.08)" />
                    <XAxis type="number" tick={{ fill: COLORS.ink, fontSize: 12 }} tickFormatter={moneyTick} />
                    <YAxis type="category" dataKey="label" width={110} tick={{ fill: COLORS.ink, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sales" fill={COLORS.mint} radius={[0, 8, 8, 0]} name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartShell>
            </div>
          </section>

          {zoomedChart && <div className="zoom-backdrop" onClick={() => setZoomedChart(null)} />}
        </main>
      </div>
    </div>
  );
}

export default App;
