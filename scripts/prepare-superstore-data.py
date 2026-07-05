from pathlib import Path
import json
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = Path('/Users/niharrout/Documents/My Tableau Repository/Datasources/2024.3/en_US-APAC/Sample - Superstore.xls')


def round2(value):
    return round(float(value), 2)


def main():
    orders = pd.read_excel(WORKBOOK, sheet_name='Orders')
    returns = pd.read_excel(WORKBOOK, sheet_name='Returns')
    returned_ids = set(returns['Order ID'].astype(str).tolist())

    orders['Order Date'] = pd.to_datetime(orders['Order Date'])
    orders['Ship Date'] = pd.to_datetime(orders['Ship Date'])
    orders['Year'] = orders['Order Date'].dt.year
    orders['Month'] = orders['Order Date'].dt.month_name().str[:3]
    orders['Returned'] = orders['Order ID'].astype(str).isin(returned_ids)

    records = []
    for _, row in orders.iterrows():
        records.append(
            {
                'orderId': str(row['Order ID']),
                'orderDate': row['Order Date'].strftime('%Y-%m-%d'),
                'shipDate': row['Ship Date'].strftime('%Y-%m-%d'),
                'shipMode': str(row['Ship Mode']),
                'segment': str(row['Segment']),
                'region': str(row['Region']),
                'category': str(row['Category']),
                'subCategory': str(row['Sub-Category']),
                'state': str(row['State/Province']),
                'city': str(row['City']),
                'customerName': str(row['Customer Name']),
                'sales': round2(row['Sales']),
                'quantity': int(row['Quantity']),
                'discount': round2(row['Discount']),
                'profit': round2(row['Profit']),
                'returned': bool(row['Returned']),
                'year': int(row['Year']),
                'month': str(row['Month']),
            }
        )

    summary = {
        'overall': {
            'sales': round2(orders['Sales'].sum()),
            'profit': round2(orders['Profit'].sum()),
            'quantity': int(orders['Quantity'].sum()),
            'orders': int(orders['Order ID'].nunique()),
            'customers': int(orders['Customer ID'].nunique()),
            'products': int(orders['Product ID'].nunique()),
            'profitMargin': round2(orders['Profit'].sum() / orders['Sales'].sum() * 100),
            'returnOrders': int(orders.loc[orders['Returned'], 'Order ID'].nunique()),
            'returnRate': round2(orders.loc[orders['Returned'], 'Order ID'].nunique() / orders['Order ID'].nunique() * 100),
        },
        'yearly': orders.groupby('Year')[['Sales', 'Profit']].sum().round(2).reset_index().to_dict('records'),
        'region': orders.groupby('Region')[['Sales', 'Profit']].sum().round(2).reset_index().sort_values('Sales', ascending=False).to_dict('records'),
        'category': orders.groupby('Category')[['Sales', 'Profit']].sum().round(2).reset_index().sort_values('Sales', ascending=False).to_dict('records'),
        'topStates': orders.groupby('State/Province')[['Sales', 'Profit']].sum().round(2).reset_index().sort_values('Sales', ascending=False).head(10).to_dict('records'),
        'subCategoryProfit': orders.groupby('Sub-Category')['Profit'].sum().round(2).sort_values().reset_index().rename(columns={'Sub-Category': 'subCategory'}).to_dict('records'),
        'shipMode': orders.groupby('Ship Mode')[['Sales', 'Profit']].sum().round(2).reset_index().sort_values('Sales', ascending=False).to_dict('records'),
        'monthlyTrend': orders.groupby(orders['Order Date'].dt.to_period('M'))[['Sales', 'Profit']].sum().round(2).reset_index().rename(columns={'Order Date': 'period'}).assign(period=lambda d: d['period'].astype(str)).to_dict('records'),
    }

    (ROOT / 'src/data/superstore-data.json').write_text(json.dumps(records, ensure_ascii=True))
    (ROOT / 'src/data/superstore-summary.json').write_text(json.dumps(summary, ensure_ascii=True, indent=2))
    print(f'wrote {len(records)} records')


if __name__ == '__main__':
    main()
