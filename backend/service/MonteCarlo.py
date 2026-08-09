from urllib import response
import numpy as numpy
import datetime as datetime
import adapter.YahooFinanceData as yahooFinanceData
import orjson
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

    # Monte Carlo Method
    numberOfSimulations = 1000 # number of simulations
    T = holdingPeriodInDays #timeframe in days

    meanM = numpy.full(shape=(T, len(weights)), fill_value=meanReturns)
    meanM = meanM.T

    # Cholesky factor of the covariance matrix is the same for every
    # simulation, so it only needs to be computed once.
    L = numpy.linalg.cholesky(covMatrix)

    # Generate all simulations' random shocks at once and evolve every
    # path in a single vectorized computation instead of looping in
    # Python (equivalent to per-simulation meanM + L @ Z.T, stacked over
    # the simulation axis m).
    Z = numpy.random.normal(size=(numberOfSimulations, T, len(weights)))
    dailyReturns = meanM + numpy.einsum('ik,mjk->mij', L, Z)
    portfolioDailyReturns = numpy.einsum('n,mnt->mt', weights, dailyReturns)
    portfolioSimulation = numpy.ascontiguousarray(
        (numpy.cumprod(portfolioDailyReturns + 1, axis=1) * initialPortfolio).T
    )

    portResults = portfolioSimulation[-1, :]
    valueAtRisk = initialPortfolio - mcVaR(portResults, alpha=5)
    conditionalValueAtRisk = initialPortfolio - mcCVaR(portResults, alpha=5)

    response = ValueAtRisk(conditionalValueAtRisk, valueAtRisk, portfolioSimulation)
    return orjson.dumps(response.__dict__, option=orjson.OPT_SERIALIZE_NUMPY).decode('utf-8')


def mcVaR(returns, alpha=5):
    """ Input: numpy array of returns
        Output: percentile on return distribution to a given confidence level alpha
    """
    if isinstance(returns, numpy.ndarray):
        return numpy.percentile(returns, alpha)
    else:
        raise TypeError("Expected a numpy array.")

def mcCVaR(returns, alpha=5):
    """ Input: numpy array of returns
        Output: CVaR or Expected Shortfall to a given confidence level alpha
    """
    if isinstance(returns, numpy.ndarray):
        belowVaR = returns <= mcVaR(returns, alpha=alpha)
        return returns[belowVaR].mean()
    else:
        raise TypeError("Expected a numpy array.")


