/**
 * Features:
 * A. Get data of stock symbol from Alpha Vantage API (100 Stock symbols from Nasdaq) function=TIME_SERIES_DAILY_ADJUSTED
 * B. Calculate trending strength indicator normed to 100%
 * C. Store data in Deno KV store
 * D. Create PDF report that lists the trending stocks in a table
 */

import { indicators, series } from "./alphavantage/client.ts";
import nasdaqSymbols from "./ndx.json" assert { type: "json" };

const aaplSymbol = nasdaqSymbols.find((symbol) => symbol === "AAPL") || "";
const aapl = await series.get(aaplSymbol, "TIME_SERIES_WEEKLY_ADJUSTED");

console.log(Object.keys(aapl));

const aaplSma = await indicators.get(aaplSymbol, {
  indicator: "MACD",
  period: 12,
  length: 26,
  interval: "daily",
});
console.log(Object.keys(aaplSma));
