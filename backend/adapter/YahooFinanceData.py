from scipy.stats import norm, t
import matplotlib.pyplot as plt
import yfinance as yf

def getStockData(stocks, start, end):
    #TODO: Make this static and singleton somehow
    responseData = None

    #TODO: Check if the start & end date is different
    if (responseData is None):
        yf.enable_debug_mode()
        responseData = yf.download(stocks, start=start, end=end)
        return responseData
    else:
        return responseData

# Import data
def getData(stocks, start, end):
    stockData = getStockData(stocks, start, end)
    # print(stockData)
    stockData = stockData['Close']
    returns = stockData.pct_change()
    meanReturns = returns.mean()
    covMatrix = returns.cov()
    return returns, meanReturns, covMatrix

def getPriceData(stocks, start, end):
    stockData = getStockData(stocks, start, end)
    # print(stockData)
    return stockData