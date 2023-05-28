import { series } from "../alphavantage/client.ts";
import stockSymbols from "../symbols.json" assert { type: "json" };
import { join } from "https://deno.land/std@0.188.0/path/mod.ts";


let waitInterval = 12000;
const date = new Date().toISOString().split("T")[0];
const directory = join(Deno.cwd(), "data", "series", date);
await Deno.mkdir(directory, { recursive: true });
for (const symbol of stockSymbols) {
  await new Promise((resolve) => setTimeout(resolve, waitInterval));
  console.log("Fetching symbol: ", symbol);
  const serie = await series.get(symbol, "TIME_SERIES_DAILY_ADJUSTED");

  if (Object.keys(serie).length < 2) {
    console.log("No data for", symbol);
    console.log("Response", serie);
    await new Promise((resolve) => setTimeout(resolve, waitInterval));
    waitInterval += 2000;
    continue;
  }
  await Deno.writeTextFile(join(directory, `${symbol}_${date}.json`), JSON.stringify(serie));
}