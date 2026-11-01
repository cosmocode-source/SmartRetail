import { describe, expect, it } from "vitest";
import { forecastSales, stockAdvice } from "@/lib/services/forecast";

describe("sales outlook", () => {
  it("includes zero-sale days and compares complete weeks", () => {
    const days = Array.from({ length: 14 }, (_, n) => ({ day: String(n), revenue: n < 7 ? "100" : "200", transactions: 1 }));
    expect(forecastSales(days)).toMatchObject({ nextWeek: 1050, changePercent: 100 });
    days[0] = { day: "0", revenue: "0", transactions: 0 };
    expect(forecastSales(days).nextWeek).toBe(1000);
  });
  it("withholds sparse estimates and avoids division by zero", () => {
    expect(forecastSales(Array.from({ length: 14 }, (_, n) => ({ day: String(n), revenue: n === 13 ? "500" : "0", transactions: n === 13 ? 5 : 0 })))).toMatchObject({ nextWeek: null, changePercent: null });
    const days = Array.from({ length: 14 }, (_, n) => ({ day: String(n), revenue: n > 10 ? "100" : "0", transactions: n > 10 ? 1 : 0 }));
    expect(forecastSales(days)).toMatchObject({ nextWeek: 150, changePercent: null });
  });
});

describe("inventory advice", () => {
  const item = { productId: 1, name: "Tea", quantity: 4, reorderThreshold: 5, unitsSold: 28, pendingQty: 0 };
  it("forecasts stock cover and accounts for pending orders", () => {
    expect(stockAdvice(item)).toMatchObject({ daysLeft: 2, orderQty: 24, priority: 1 });
    expect(stockAdvice({ ...item, pendingQty: 30 })).toMatchObject({ orderQty: 0, advice: "Planned orders cover the target; check delivery dates." });
  });
  it("does not invent demand for unsold stock", () => {
    expect(stockAdvice({ ...item, unitsSold: 0, quantity: 50 })).toMatchObject({ daysLeft: null, orderQty: 0, priority: 2 });
    expect(stockAdvice({ ...item, unitsSold: 0, quantity: 0 })).toMatchObject({ daysLeft: null, orderQty: 5, priority: 0 });
  });
});
