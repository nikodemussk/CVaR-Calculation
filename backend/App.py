from flask import Flask
from flask import request
from flask import Response

import service.MonteCarlo as monteCarlo

# stockList = ['CBA', 'BHP', 'TLS', 'NAB', 'WBC', 'STO']

# monteCarlo.calcualteCVar(stockList)

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, World!"

#TODO: Add Bearer/OAUTH validation
@app.post('/api/cvarCalculation')
def cvarCalculation():
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
