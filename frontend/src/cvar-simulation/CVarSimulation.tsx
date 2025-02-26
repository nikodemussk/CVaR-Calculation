import React, { useEffect, useState } from "react";
import { AllCommunityModule, ColDef, ColGroupDef, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";

ModuleRegistry.registerModules([AllCommunityModule]);

interface StockPrice {
    datetime: String,
    close: String,
    high: String,
    low: String,
    open: String,
    volume: String
}


export const CVarSimulation = () => {
    const [rowData, setRowData] = useState<StockPrice[]>();
    const [portfolioSimulation, setPortfolioSimulation] = useState<[]>();
    const [agChartOptions, setAgChartOptions] = useState<AgChartOptions>();

    const setChartOption = (portfolioSimulationData : []) : AgChartOptions => {
        let series : any  = [];

        for (let i = 0; i < 1000; i++) {
            series.push({
                type: "line",
                xKey: "day",
                yKey: i.toString(),
                // yName: "Simulation " + (i+1),
            })
        }

        return {
            title: {
                text: "Monte Carlo CVar Calculation",
            },
            data: portfolioSimulationData,
            series: series,
            legend: {
                enabled: false,
            },
        }
    }


    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState<(ColDef<any> | ColGroupDef<any>)[]>([
        { headerName: "Date", field: "datetime" },
        { headerName: "Closing Price", field: "close" },
        { headerName: "High", field: "high" },
        { headerName: "Low", field: "low" },
        { headerName: "Open", field: "open" },
        { headerName: "Volume", field: "volume" }
    ]);


    const testMapping = (data: {}) => {
        let stockData: any = data
        let timestamp = Object.keys(stockData["('Close', 'MSFT')"])
        timestamp.map(time => {
            let close = stockData["('Close', 'MSFT')"][time]
            let high = stockData["('High', 'MSFT')"][time]
            let low = stockData["('Low', 'MSFT')"][time]
            let open = stockData["('Open', 'MSFT')"][time]
            let volume = stockData["('Volume', 'MSFT')"][time]

            const stockPrice: StockPrice = {
                datetime: new Date(parseInt(time)).toLocaleDateString("en-GB"),
                close: close,
                high: high,
                low: low,
                open: open,
                volume: volume
            }

            setRowData(oldArray => {
                if (undefined !== oldArray) {
                    return [...(oldArray as []), stockPrice]
                }
                return [stockPrice]
            })
        })
    }

    const mapPortfolioSimulationData = (data: []) => {
        let simulationResult: [] = []
         let i = 1;
        data.portfolioSimulation.map(simulation => {
            simulationResult.push(Object.assign({day: i++}, simulation))
        })

        setPortfolioSimulation(simulationResult)
        console.log(simulationResult)
        return simulationResult
    }

    useEffect(() => {
        var myHeaders = new Headers();
        myHeaders.append("X-Version", "1.0.0");
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "stocks": [
                "MSFT"
            ],
            "days": 9
        });

        var requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("http://127.0.0.1:5000/api/closingPrice", requestOptions)
            .then(response => response.json())
            .then(result => testMapping(result))
            .catch(error => console.log('error', error));


        fetch("http://127.0.0.1:5000/api/cvarCalculation", requestOptions)
            .then(response => response.json())
            .then(result => mapPortfolioSimulationData(result))
            .then(result => setAgChartOptions(setChartOption(result)))
            .catch(error => console.log('error', error));
    }, []);

    return (
        <>
            <div style={{ display: "inline-flex", width: "90vw" }} className="flex-row-reverse">
                <div className="col-5">
                    <p>Stock Name: </p>
                </div>
                <Menu as="div" className="relative inline-block text-left" style={{ position: "absolute", zIndex: "999", backgroundColor: "#FFFFFF", borderRadius: "10px" }}>
                    <div>
                        <MenuButton style={{ display: "inline-flex", width: "121%" }} className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
                            Options
                            <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                        </MenuButton>
                    </div>

                    {["MSFT", "AAPL"].map(stockLabel => {
                        return (
                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                            >
                                <div className="py-1">
                                    <MenuItem>
                                        {/* <a
                                        href="#"
                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                                    > */}
                                        <p>{stockLabel}</p>
                                        {/* </a> */}
                                    </MenuItem>
                                </div>
                            </MenuItems>

                        )
                    })}
                </Menu>
            </div>

            <div className="relative inline-block text-left" style={{ height: 500, width: 1230 }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                />
            </div>

            <div className="relative inline-block text-left" style={{ height: 500, width: 1230 }}>
                    <   AgCharts options={agChartOptions!} />
            </div>
        </>
    )
}


