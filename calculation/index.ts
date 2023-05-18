import type {
  AVSeries,
  AVSeriesResponse,
  MetaData,
} from "../alphavantage/client.ts";

export type RSIResponse = {
  "Meta Data": MetaData;
  "Technical Analysis: RSI": {
    [date: string]: {
      "RSI": string;
    };
  };
};

function isDailySeries(
  input: AVSeriesResponse[AVSeries],
): input is AVSeriesResponse["TIME_SERIES_DAILY_ADJUSTED"] {
  return "Time Series (Daily)" in input;
}

type CalculateRSIParams = {
  period: number;
};

const rsiKey = "Technical Analysis: RSI";

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
    for (let n = entries.length - 1; n > 0; n--) {
      const [_date, data] = entries[n];
      const { "4. close": close } = data;
      const previous = entries[n - 1];
      const { "4. close": previousClose } = previous[1];
      const difference = Number(close) - Number(previousClose);
      differences.push(difference);
      if (differences.length > period) {
        throw new Error("Error: Differences array is too long");
      } else if (differences.length < period) {
        // Fill up differences array with period length
        continue;
      } else {
        const RSUp = sum(...differences.filter((d) => d >= 0)) / period;
        const RSDown = sum(...differences.filter((d) => d <= 0)) / period;
        const RS = RSUp / RSDown;
        const RSI = (100 - (100 / (1 + RS))).toString();
        const [date, _] = entries[n];
        result[rsiKey][date] = { RSI };

        differences.shift();
      }
    }

    return result;
  },
};
