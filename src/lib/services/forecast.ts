export type SalesDay = { day: string; revenue: string; transactions: number };
export type StockDemand = { productId: number; name: string; quantity: number; reorderThreshold: number; unitsSold: number; pendingQty: number };

// A deliberately small baseline: 14 complete calendar days, including zero-sale days.
export function forecastSales(days: SalesDay[]) {
  const transactions = days.reduce((sum, day) => sum + day.transactions, 0);
  const sellingDays = days.filter((day) => day.transactions > 0).length;
  const previousWeek = days.slice(0, 7).reduce((sum, day) => sum + Number(day.revenue), 0);
  const recentWeek = days.slice(7).reduce((sum, day) => sum + Number(day.revenue), 0);
  const enoughData = days.length === 14 && sellingDays >= 3 && transactions >= 3;
  return {
    enoughData, transactions, sellingDays, previousWeek, recentWeek,
    nextWeek: enoughData ? Math.round((previousWeek + recentWeek) / 2 * 100) / 100 : null,
    changePercent: enoughData && previousWeek > 0 ? Math.round((recentWeek - previousWeek) / previousWeek * 100) : null
  };
}

export function stockAdvice(item: StockDemand) {
  const dailyDemand = item.unitsSold / 14;
  const daysLeft = dailyDemand > 0 ? Math.round(item.quantity / dailyDemand * 10) / 10 : null;
  const target = Math.max(item.reorderThreshold, Math.ceil(dailyDemand * 14));
  const orderQty = Math.max(0, target - item.quantity - item.pendingQty);
  const low = item.quantity <= item.reorderThreshold || (daysLeft !== null && daysLeft <= 7);
  const slow = item.unitsSold === 0 && item.quantity > Math.max(item.reorderThreshold * 2, 0);
  const priority = item.quantity === 0 ? 0 : low ? 1 : slow ? 2 : 3;
  const advice = low
    ? orderQty > 0 ? `Consider ordering ${orderQty} units.` : item.pendingQty > 0 ? "Planned orders cover the target; check delivery dates." : "Review stock and set a reorder threshold."
    : slow ? "No sales in 14 days: check demand before buying more." : "Stock looks sufficient at the recent sales pace.";
  return { ...item, dailyDemand, daysLeft, orderQty, priority, advice };
}
