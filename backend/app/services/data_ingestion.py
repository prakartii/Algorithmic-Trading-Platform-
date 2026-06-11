import yfinance as yf
from datetime import date


class TickerNotFoundError(Exception):
    pass


class DataIngestionService:
    def fetch_ohlcv(
        self,
        symbol: str,
        start: date,
        end: date,
        interval: str = "1d",
    ) -> list[dict]:
        df = yf.Ticker(symbol).history(
            start=start.isoformat(),
            end=end.isoformat(),
            interval=interval,
            auto_adjust=True,
        )

        if df.empty:
            raise TickerNotFoundError(f"No data found for '{symbol}' in the requested range.")

        df.index = df.index.tz_localize(None) if df.index.tzinfo else df.index
        df = df.reset_index()

        return [
            {
                "date": row["Date"].strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 4),
                "high": round(float(row["High"]), 4),
                "low": round(float(row["Low"]), 4),
                "close": round(float(row["Close"]), 4),
                "volume": int(row["Volume"]),
            }
            for _, row in df.iterrows()
        ]
