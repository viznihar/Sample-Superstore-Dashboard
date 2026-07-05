import { Filter, RotateCcw } from 'lucide-react';

const FilterSelect = ({ label, value, onChange, options }) => (
  <label className="filter-field">
    <span>{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default function FilterBar({ filters, setFilters, yearOptions, regionOptions, categoryOptions, segmentOptions, shipModeOptions }) {
  return (
    <section className="filter-bar">
      <div className="filter-bar__title">
        <Filter size={18} />
        <div>
          <h2>Interactive Filters</h2>
          <p>Use these controls to narrow the dashboard in real time.</p>
        </div>
      </div>

      <div className="filter-bar__controls">
        <FilterSelect label="Year" value={filters.year} onChange={(year) => setFilters((prev) => ({ ...prev, year }))} options={yearOptions} />
        <FilterSelect label="Region" value={filters.region} onChange={(region) => setFilters((prev) => ({ ...prev, region }))} options={regionOptions} />
        <FilterSelect label="Category" value={filters.category} onChange={(category) => setFilters((prev) => ({ ...prev, category }))} options={categoryOptions} />
        <FilterSelect label="Segment" value={filters.segment} onChange={(segment) => setFilters((prev) => ({ ...prev, segment }))} options={segmentOptions} />
        <FilterSelect label="Ship Mode" value={filters.shipMode} onChange={(shipMode) => setFilters((prev) => ({ ...prev, shipMode }))} options={shipModeOptions} />
        <button className="reset-button" type="button" onClick={() => setFilters({ year: 'All', region: 'All', category: 'All', segment: 'All', shipMode: 'All' })}>
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </section>
  );
}
