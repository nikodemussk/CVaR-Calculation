from flask import Flask
from flask import request
from flask import Response
from flask_cors import CORS

import datetime as datetime
import service.MonteCarlo as monteCarlo
import adapter.YahooFinanceData as yahooFinanceData
# stockList = ['CBA', 'BHP', 'TLS', 'NAB', 'WBC', 'STO']

# monteCarlo.calcualteCVar(stockList)

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Hello, World!"

#TODO: Add Bearer/OAUTH validation
#TODO: Move to Controller
@app.post('/api/closingPrice')
def closingPriceStock(): 
    return "{\"('Close', 'MSFT')\":{\"1741219200000\":396.8900146484,\"1741305600000\":393.3099975586,\"1741564800000\":380.1600036621,\"1741651200000\":380.450012207,\"1741737600000\":383.2699890137,\"1741824000000\":378.7699890137,\"1741910400000\":388.5599975586},\"('High', 'MSFT')\":{\"1741219200000\":402.1499938965,\"1741305600000\":394.799987793,\"1741564800000\":386.3999938965,\"1741651200000\":386,\"1741737600000\":385.2200012207,\"1741824000000\":385.3200073242,\"1741910400000\":390.2300109863},\"('Low', 'MSFT')\":{\"1741219200000\":392.6799926758,\"1741305600000\":385.5400085449,\"1741564800000\":377.2200012207,\"1741651200000\":376.9100036621,\"1741737600000\":378.950012207,\"1741824000000\":377.450012207,\"1741910400000\":379.5100097656},\"('Open', 'MSFT')\":{\"1741219200000\":394.2799987793,\"1741305600000\":392.3200073242,\"1741564800000\":385.8399963379,\"1741651200000\":379,\"1741737600000\":382.950012207,\"1741824000000\":383.1600036621,\"1741910400000\":379.7799987793},\"('Volume', 'MSFT')\":{\"1741219200000\":23304600,\"1741305600000\":22034100,\"1741564800000\":32840100,\"1741651200000\":30380200,\"1741737600000\":24253600,\"1741824000000\":20473000,\"1741910400000\":19929300}}"
    apiVersion = request.headers.get('X-Version')
    requestData = request.json
    #TODO: Refactor - remove duplicaate
    if (requestData is None):
        return Response(
            "Request body is missing",
            status=400,
        )

    if (apiVersion is None):
        return Response(
            "Version not found",
            status=400,
        )
     #TODO: Validate the data if present and valid
    stocks = requestData["stocks"] 
    days = requestData["days"]
    endDate = datetime.datetime.now()
    startDate = endDate - datetime.timedelta(days=days)
    closingPrice = yahooFinanceData.getPriceData(stocks=stocks, start=startDate, end=endDate)
    print(type(closingPrice))
    return closingPrice.to_json()

#TODO: Add Bearer/OAUTH validation
#TODO: Move to Controller
@app.post('/api/cvarCalculation')
def cvarCalculation():
    f = open("mockresponse.txt", "r")
    return f
    apiVersion = request.headers.get('X-Version')
    requestData = request.json
    if (requestData is None):
        return Response(
            "Request body is missing",
            status=400,
        )

    if (apiVersion is None):
        return Response(
            "Version not found",
            status=400,
        )

    #TODO: Validate the data if present and valid
    stocks = requestData["stocks"] 
    initialPortfolio = requestData["initialPortfolio"]
    holdingPeriodInDays = requestData["holdingPeriodInDays"]

    #TODO: Update to use match case when upgrading to Python 3.10 or higher
    return {
        "1.0.0": monteCarlo.calcualteCVar(stocks, initialPortfolio, holdingPeriodInDays),
        #TODO: If Version invaild, return 400 Bad Request
    }.get(apiVersion, 0)
