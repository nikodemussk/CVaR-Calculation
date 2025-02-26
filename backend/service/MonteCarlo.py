from urllib import response
import pandas as pd
import numpy as numpy
import datetime as datetime
import adapter.YahooFinanceData as yahooFinanceData
import json 
from service.model.ValueAtRisk import ValueAtRisk

def portfolioPerformance(weights, meanReturns, covMatrix, Time):
    returns = numpy.sum(meanReturns*weights)*Time
    std = numpy.sqrt( numpy.dot(weights.T, numpy.dot(covMatrix, weights)) ) * numpy.sqrt(Time)
    return returns, std

#TODO: Refactor - Extract Method 
def calcualteCVar(stockList, initialPortfolio, holdingPeriodInDays):
    stocks = [stock for stock in stockList]
    endDate = datetime.datetime.now()
    startDate = endDate - datetime.timedelta(days=holdingPeriodInDays)

    returns, meanReturns, covMatrix = yahooFinanceData.getData(stocks, start=startDate, end=endDate)
    returns = returns.dropna()

    weights = numpy.random.random(len(returns.columns))
    weights /= numpy.sum(weights)

    returns['portfolio'] = returns.dot(weights)
    print(returns)
   
    # Monte Carlo Method
    numberOfSimulations = 1000 # number of simulations
    T = holdingPeriodInDays #timeframe in days

    meanM = numpy.full(shape=(T, len(weights)), fill_value=meanReturns)
    meanM = meanM.T

    portfolioSimulation = numpy.full(shape=(T, numberOfSimulations), fill_value=0.0)

    for m in range(0, numberOfSimulations):
        # MC loops
        Z = numpy.random.normal(size=(T, len(weights)))
        L = numpy.linalg.cholesky(covMatrix)
        dailyReturns = meanM + numpy.inner(L, Z)
        portfolioSimulation[:,m] = numpy.cumprod(numpy.inner(weights, dailyReturns.T)+1)*initialPortfolio
        portResults = pd.Series(portfolioSimulation[-1,:])

        valueAtRisk = initialPortfolio - mcVaR(portResults, alpha=5)
        conditionalValueAtRisk = initialPortfolio - mcCVaR(portResults, alpha=5)
    # print(portfolioSimulation)
    # print('VaR ${}'.format(round(VaR,2)))
    # print('CVaR ${}'.format(round(CVaR,2)))
    response = ValueAtRisk(valueAtRisk, conditionalValueAtRisk, portfolioSimulation.tolist())
    return json.dumps(response.__dict__) 
     

def mcVaR(returns, alpha=5):
    """ Input: pandas series of returns
        Output: percentile on return distribution to a given confidence level alpha
    """
    if isinstance(returns, pd.Series):
        return numpy.percentile(returns, alpha)
    else:
        raise TypeError("Expected a pandas data series.")

def mcCVaR(returns, alpha=5):
    """ Input: pandas series of returns
        Output: CVaR or Expected Shortfall to a given confidence level alpha
    """
    if isinstance(returns, pd.Series):
        belowVaR = returns <= mcVaR(returns, alpha=alpha)
        return returns[belowVaR].mean()
    else:
        raise TypeError("Expected a pandas data series.")


