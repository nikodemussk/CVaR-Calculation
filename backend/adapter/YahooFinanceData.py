from scipy.stats import norm, t
import matplotlib.pyplot as plt
import yfinance as yf
import threading
import time

# Fetching from Yahoo Finance over the network takes seconds, which blows
# any request-latency budget. Daily closing prices don't change intraday,
# so we keep an in-memory cache keyed by (stocks, date range) and refresh
# it proactively on a background thread, well before it goes stale.
# Requests then read from cache (sub-millisecond) instead of hitting the
# network inline.
_CACHE_TTL_SECONDS = 300
_REFRESH_INTERVAL_SECONDS = 60

_cacheLock = threading.Lock()
_cache = {}  # key -> (data, fetchedAtMonotonic)


def _cacheKey(stocks, start, end):
    return (tuple(sorted(stocks)), start.date(), end.date())


def _fetchFromYahoo(stocks, start, end):
    return yf.download(stocks, start=start, end=end)


def _refreshLoop():
    while True:
        time.sleep(_REFRESH_INTERVAL_SECONDS)
        with _cacheLock:
            keys = list(_cache.keys())
        for stocks, startDate, endDate in keys:
            try:
                data = _fetchFromYahoo(list(stocks), startDate, endDate)
                with _cacheLock:
                    _cache[(stocks, startDate, endDate)] = (data, time.monotonic())
            except Exception:
                # Keep serving the last good snapshot if a refresh fails.
                pass


_refreshThread = threading.Thread(target=_refreshLoop, daemon=True)
_refreshThread.start()


def getStockData(stocks, start, end):
    key = _cacheKey(stocks, start, end)

    with _cacheLock:
        cached = _cache.get(key)
    if cached is not None and (time.monotonic() - cached[1]) < _CACHE_TTL_SECONDS:
        return cached[0]

    responseData = _fetchFromYahoo(stocks, start, end)
    with _cacheLock:
        _cache[key] = (responseData, time.monotonic())
    return responseData


# Import data
def getData(stocks, start, end):
    stockData = getStockData(stocks, start, end)
    stockData = stockData['Close']
    returns = stockData.pct_change()
    meanReturns = returns.mean()
    covMatrix = returns.cov()
    return returns, meanReturns, covMatrix

def getPriceData(stocks, start, end):
    stockData = getStockData(stocks, start, end)
    return stockData
