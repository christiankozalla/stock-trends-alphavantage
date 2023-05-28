import { startServer } from "./web/server.ts";
import { calculate } from "./calculation/indicators.ts";
import { type DataBasis, match, signals } from "./calculation/signals.ts";
import { closeDb, db } from "./db/client.ts";
import stockSymbols from "./symbols.json" assert { type: "json" };

const risingSmaPositiveRsi = (data_basis: DataBasis[]): boolean => {
  const latestValue = data_basis[data_basis.length - 1];
  const earliestValue = data_basis[0];
  const isSmaRising = latestValue.SMA > earliestValue.SMA;
  const isSmaGreaterThan50 = latestValue.SMA > 50;
  // const diffs_in_range = data_basis.filter((day) => day.Diff < -0.15 || day.Diff > 0.15).length >= 2;
  const _hasCrossing = data_basis.some((day) => day.Diff < 0) &&
    data_basis.some((day) => day.Diff > 0);
  return isSmaRising && isSmaGreaterThan50 && latestValue.Diff > 0;
};

const dir = `${Deno.cwd()}/data/series/${
  new Date().toISOString().split("T")[0]
}`;
const files = Deno.readDir(dir);
for (const symbol of stockSymbols) {
  let file;
  for await (const f of files) {
    if (f.name.startsWith(symbol)) {
      file = f;
    }
  }
  if (!file) {
    console.log(`No file for ${symbol}`);
    continue;
  }
  const serie = await Deno.readFile(`${dir}/${file.name}`).then((data) =>
    JSON.parse(new TextDecoder().decode(data))
  );
  const rsi = calculate.rsi(serie, { period: 14 });

  signals.write(rsi, match(risingSmaPositiveRsi), db);
}

startServer();

closeDb();
