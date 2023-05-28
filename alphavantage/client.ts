import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { calculate, type RSIResponse } from "../calculation/indicators.ts";

const ALPHAVANTAGE_API_KEY = config().ALPHAVANTAGE_API_KEY;

export type AVSeries =
  | "TIME_SERIES_DAILY_ADJUSTED"
  | "TIME_SERIES_WEEKLY_ADJUSTED";

type PeriodData = {
  "1. open": string;
  "2. high": string;
  "3. low": string;
  "4. close": string;
  "5. adjusted close": string;
  "6. volume": string;
  "7. dividend amount": string;
};

export type MetaData = {
  "1. Information": string;
  "2. Symbol": string;
  "3. Last Refreshed": string;
  "5. Time Zone": string;
};

export type AVSeriesResponse = {
  "TIME_SERIES_DAILY_ADJUSTED": {
    "Meta Data": MetaData & {
      "4. Output Size": string;
    };
    "Time Series (Daily)": {
      [date: string]: PeriodData;
    };
  };
  "TIME_SERIES_WEEKLY_ADJUSTED": {
    "Meta Data": MetaData;
    "Weekly Adjusted Time Series": {
      [date: string]: PeriodData & {
        "8. split coefficient": string;
      };
    };
  };
};

export const series = {
  async get<T extends AVSeries>(
    symbol: string,
    series: T,
  ): Promise<AVSeriesResponse[T]> {
    try {
      const url =
        `https://www.alphavantage.co/query?function=${series}&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();
      return json;
    } catch (e) {
      return e;
    }
  },
};
type AVIndicators = "SMA" | "EMA" | "MACD" | "RSI";

type SMAResponse = {
  "Meta Data": MetaData;
  "Technical Analysis: SMA": {
    [date: string]: {
      "SMA": string;
    };
  };
};

type EMAResponse = {
  "Meta Data": MetaData;
  "Technical Analysis: EMA": {
    [date: string]: {
      "EMA": string;
    };
  };
};

type MACDResponse = {
  "Meta Data": MetaData;
  "Technical Analysis: MACD": {
    [date: string]: {
      "MACD": string;
      "MACD_Hist": string;
      "MACD_Signal": string;
    };
  };
};

type AVIndicatorsResponse = {
  "SMA": SMAResponse;
  "EMA": EMAResponse;
  "MACD": MACDResponse;
  "RSI": RSIResponse;
};

export const indicators = {
  async get<T extends AVIndicators>(
    symbol: string,
    { indicator, period, interval = "daily" }: {
      indicator: T;
      period: number;
      interval?: "daily" | "weekly";
    },
  ): Promise<AVIndicatorsResponse[T]> {
    if (indicator === "RSI") {
      try {
        const seriesData = await series.get(
          symbol,
          interval === "daily"
            ? "TIME_SERIES_DAILY_ADJUSTED"
            : "TIME_SERIES_WEEKLY_ADJUSTED",
        );
        return calculate.rsi(seriesData, { period }) as AVIndicatorsResponse[T];
      } catch (e) {
        return e;
      }
    } else {
      try {
        const url =
          `https://www.alphavantage.co/query?function=${indicator}&symbol=${symbol}&interval=${interval}&time_period=${period}&series_type=close&apikey=${ALPHAVANTAGE_API_KEY}`;
        const response = await fetch(url);
        const json: AVIndicatorsResponse[T] = await response.json();
        return json;
      } catch (e) {
        return e;
      }
    }
  },
};
