import type {
  AVSeries,
  AVSeriesResponse,
  MetaData,
} from "../alphavantage/client.ts";

const rsiKey = "Technical Analysis: RSI";

export type RSIBasis = {
  [date: string]: {
    RSI: number;
    SMA: number;
  };
};

export type RSIResponse = {
  "Meta Data": MetaData;
  [rsiKey]: RSIBasis;
};

function isDailySeries(
  input: AVSeriesResponse[AVSeries],
): input is AVSeriesResponse["TIME_SERIES_DAILY_ADJUSTED"] {
  return "Time Series (Daily)" in input;
}

type CalculateRSIParams = {
  period: number;
};

function sum(...summands: number[]) {
  return summands.reduce((sum, summand) => sum + Math.abs(summand), 0);
}

export const calculate = {
  rsi<T extends AVSeries>(
    input: AVSeriesResponse[T],
    {
      period = 14,
    }: CalculateRSIParams,
  ): RSIResponse {
    let entries;
    const result: RSIResponse = {
      "Meta Data": input["Meta Data"],
      [rsiKey]: {},
    };
    if (isDailySeries(input)) {
      entries = Object.entries(input["Time Series (Daily)"]);
    } else {
      entries = Object.entries(input["Weekly Adjusted Time Series"]);
    }
    const differences = [];
    const pastRSIs = [];
    let prevRSUp;
    let prevRSDown;
    for (let n = entries.length - 2; n >= 0; n--) {
      const [_date, data] = entries[n];
      const { "4. close": close } = data;
      const previous = entries[n + 1];
      const { "4. close": previousClose } = previous[1];
      const difference = Number(close) - Number(previousClose);
      differences.push(difference);
      if (differences.length > period) {
        throw new Error("Error: Differences array is too long");
      } else if (differences.length < period) {
        // Fill up differences array with period length
        continue;
      } else {
        const gains = differences.filter((d) => d >= 0);
        const losses = differences.filter((d) => d < 0);
        if (gains.length + losses.length !== period) {
          console.log("WRONG SUM", gains.length + losses.length);
        }
        const gain = difference > 0 ? difference : 0;
        const loss = difference < 0 ? Math.abs(difference) : 0;
        const RSUp: number = prevRSUp ? ((prevRSUp * (period - 1) + gain) / period) : sum(...gains) / gains.length;
        const RSDown: number = prevRSDown ? ((prevRSDown * (period - 1) + loss) / period)  : sum(...losses) / losses.length;

        prevRSUp = RSUp;
        prevRSDown = RSDown;

        const RS = RSUp / RSDown;
        const RSI = 100 - (100 / (1 + RS));
        const [date, _] = entries[n];

        pastRSIs.push(RSI);
        differences.shift();
        if (pastRSIs.length === period) {
          const SMA = pastRSIs.reduce((sum, summand) => sum + summand, 0) /
            period;
          result[rsiKey][date] = { RSI, SMA };
          pastRSIs.shift();
        } else {
          // Fill up pastRSIs array with period length
          continue;
        }
      }
    }
    return result;
  },
};
