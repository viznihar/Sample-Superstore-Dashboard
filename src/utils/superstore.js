export const COLORS = {
  mint: '#99B898',
  sand: '#FECEA8',
  coral: '#FF847C',
  rose: '#E84A5F',
  ink: '#2A363B',
};

export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const currency2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export const whole = new Intl.NumberFormat('en-US');

export function formatNumber(value) {
  return whole.format(Math.round(value));
}

export function formatMoney(value) {
  return currency.format(value);
}

export function formatMoney2(value) {
  return currency2.format(value);
}

export function formatPercent(value) {
  return percent.format(value);
}

export function uniqueValues(rows, key) {
  return [...new Set(rows.map((row) => row[key]))].filter(Boolean).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
  });
}

export function applyFilters(rows, filters) {
  return rows.filter((row) => {
    if (filters.year !== 'All' && String(row.year) !== filters.year) return false;
    if (filters.region !== 'All' && row.region !== filters.region) return false;
    if (filters.category !== 'All' && row.category !== filters.category) return false;
    if (filters.segment !== 'All' && row.segment !== filters.segment) return false;
    if (filters.shipMode !== 'All' && row.shipMode !== filters.shipMode) return false;
    return true;
  });
}

export function decodePack(pack) {
  const dicts = pack.dicts;

  return pack.rows.map((row) => ({
    orderId: dicts.orderIds[row[0]],
    orderDate: row[1],
    shipDate: row[2],
    shipMode: dicts.shipModes[row[3]],
    segment: dicts.segments[row[4]],
    region: dicts.regions[row[5]],
    category: dicts.categories[row[6]],
    subCategory: dicts.subCategories[row[7]],
    state: dicts.states[row[8]],
    sales: row[9],
    quantity: row[10],
    discount: row[11],
    profit: row[12],
    returned: Boolean(row[13]),
    year: row[14],
  }));
}

function createAggregate(label, sortKey) {
  return {
    label,
    sortKey,
    sales: 0,
    profit: 0,
    quantity: 0,
    discountTotal: 0,
    rowCount: 0,
    orderIds: new Set(),
    returnedOrderIds: new Set(),
  };
}

export function aggregateBy(rows, labelFn, sortFn = null) {
  const map = new Map();

  for (const row of rows) {
    const label = labelFn(row);
    if (!map.has(label)) {
      map.set(label, createAggregate(label, sortFn ? sortFn(row) : label));
    }

    const bucket = map.get(label);
    bucket.sales += row.sales;
    bucket.profit += row.profit;
    bucket.quantity += row.quantity;
    bucket.discountTotal += row.discount;
    bucket.rowCount += 1;
    bucket.orderIds.add(row.orderId);
    if (row.returned) bucket.returnedOrderIds.add(row.orderId);
  }

  return [...map.values()]
    .map((bucket) => ({
      label: bucket.label,
      sortKey: bucket.sortKey,
      sales: Number(bucket.sales.toFixed(2)),
      profit: Number(bucket.profit.toFixed(2)),
      quantity: bucket.quantity,
      avgDiscount: bucket.rowCount ? Number((bucket.discountTotal / bucket.rowCount).toFixed(3)) : 0,
      orderCount: bucket.orderIds.size,
      returnedOrders: bucket.returnedOrderIds.size,
      profitMargin: bucket.sales ? Number(((bucket.profit / bucket.sales) * 100).toFixed(2)) : 0,
      returnRate: bucket.orderIds.size ? Number(((bucket.returnedOrderIds.size / bucket.orderIds.size) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => {
      if (sortFn) return a.sortKey > b.sortKey ? 1 : -1;
      return b.sales - a.sales;
    });
}

export function aggregateTrend(rows) {
  const map = new Map();

  for (const row of rows) {
    const date = new Date(row.orderDate);
    const key = `${row.year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) {
      map.set(key, createAggregate(key, date.getTime()));
    }
    const bucket = map.get(key);
    bucket.sales += row.sales;
    bucket.profit += row.profit;
    bucket.quantity += row.quantity;
    bucket.discountTotal += row.discount;
    bucket.rowCount += 1;
    bucket.orderIds.add(row.orderId);
    if (row.returned) bucket.returnedOrderIds.add(row.orderId);
  }

  return [...map.values()]
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((bucket) => {
      const [year, month] = bucket.label.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return {
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        sales: Number(bucket.sales.toFixed(2)),
        profit: Number(bucket.profit.toFixed(2)),
        quantity: bucket.quantity,
        avgDiscount: bucket.rowCount ? Number((bucket.discountTotal / bucket.rowCount).toFixed(3)) : 0,
        orderCount: bucket.orderIds.size,
        returnedOrders: bucket.returnedOrderIds.size,
        profitMargin: bucket.sales ? Number(((bucket.profit / bucket.sales) * 100).toFixed(2)) : 0,
        returnRate: bucket.orderIds.size ? Number(((bucket.returnedOrderIds.size / bucket.orderIds.size) * 100).toFixed(2)) : 0,
      };
    });
}

export function getKpis(rows) {
  const orders = new Set(rows.map((row) => row.orderId));
  const returnedOrders = new Set(rows.filter((row) => row.returned).map((row) => row.orderId));
  const sales = rows.reduce((sum, row) => sum + row.sales, 0);
  const profit = rows.reduce((sum, row) => sum + row.profit, 0);
  const quantity = rows.reduce((sum, row) => sum + row.quantity, 0);

  return {
    sales: Number(sales.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    quantity,
    orderCount: orders.size,
    profitMargin: sales ? Number(((profit / sales) * 100).toFixed(2)) : 0,
    returnRate: orders.size ? Number(((returnedOrders.size / orders.size) * 100).toFixed(2)) : 0,
  };
}

export function getTopInsights(summary) {
  const maxYear = summary.yearly.reduce((best, item) => (item.Sales > best.Sales ? item : best), summary.yearly[0]);
  const maxRegion = summary.region.reduce((best, item) => (item.Sales > best.Sales ? item : best), summary.region[0]);
  const bestCategory = summary.category.reduce((best, item) => (item.Profit > best.Profit ? item : best), summary.category[0]);
  const worstSub = summary.subCategoryProfit[0];
  const bestState = summary.topStates[0];

  return [
    `${maxYear.Year} delivered the strongest sales run at ${formatMoney(maxYear.Sales)}.`,
    `${maxRegion.Region} leads the pack on both sales and profit.`,
    `${bestCategory.Category} is the most profitable category overall.`,
    `${worstSub.subCategory} is the key loss-maker to watch closely.`,
    `${bestState['State/Province']} is the top sales state in the dataset.`,
  ];
}
