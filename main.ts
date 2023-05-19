import { indicators, series } from "./alphavantage/client.ts";
import nasdaqSymbols from "./ndx.json" assert { type: "json" };

const aaplSymbol = nasdaqSymbols.find((symbol) => symbol === "AAPL") || "";
const aapl = await series.get(aaplSymbol, "TIME_SERIES_DAILY_ADJUSTED");

console.log(Object.keys(aapl));


const aaplSma = await indicators.get("SMA", aaplSymbol, {
  period: 12,
  length: 26,
  interval: "daily",
});
console.log(Object.keys(aaplSma));
