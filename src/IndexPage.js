import React from 'react'
import api from './api'
import './styles.css'
import configData from './config.json'

import {
    LineChart,
    XAxis,
    YAxis,    
    Line,
    Tooltip,
    Label
} from 'recharts'

const IndexPage = () => {
    // Create state variables
    const [responseData, setResponseData] = React.useState('')
    const [dailyData, setDailyData] = React.useState('')
    const [Recommendation, setRecommendation] = React.useState('HOLD')
    const [recommendationClass, setRecommendationClass] = React.useState('black')
    const [symbol, setSymbol] = React.useState('')
    const [message, setMessage] = React.useState('')
    const [messageClass, setMessageClass] = React.useState('black')
    const [currentPriceClass, setCurrentPriceClass] = React.useState('black')
    const [dataDivClass, setDataDivClass] = React.useState('hide')
    

    const PERCENTAGE_OF_VOLUME = configData.PERCENTAGE_OF_VOLUME
    const PERCENTAGE_OF_PRICE = configData.PERCENTAGE_OF_PRICE

    let currentPrice = 0;
    let currentVolumne = 0;

    const calculateGetRecommendation = (closingPriceBefore7Days, last7DaysAvgVolume) => {
        let percentageOfAvgVolumne = (last7DaysAvgVolume / 100) * parseFloat(PERCENTAGE_OF_VOLUME)
        let percentageOfPriceBefore7Days = (closingPriceBefore7Days / 100) * parseFloat(PERCENTAGE_OF_PRICE)

        if((currentPrice > (closingPriceBefore7Days + percentageOfPriceBefore7Days)) 
            && (currentVolumne > (last7DaysAvgVolume + percentageOfAvgVolumne))) {
                setRecommendationClass('green')
                return 'BUY';
        }
        else if((currentPrice < (closingPriceBefore7Days - percentageOfPriceBefore7Days)) 
            && (currentVolumne < (last7DaysAvgVolume - percentageOfAvgVolumne))) {
            setRecommendationClass('red')
            return 'SELL';
        } else {
            setRecommendationClass('black')
            return 'HOLD'
        }
    }

    const getCurrentPriceClass = (currentPrice, previousClose) => {
        if (parseFloat(currentPrice) > parseFloat(previousClose)) {
            return 'green'
        } else if (parseFloat(currentPrice) < parseFloat(previousClose)) {
            return 'red'
        } else {
            return 'black'
        }
    }

    // fetches stock data based on parameters
    const fetchData = (e) => {
        e.preventDefault()

        setMessage('Loading...')

        // Get Stock Details
        api.getStockDetails(symbol)
        .then((response)=>{
            console.log(response)
            if(response.data.currentPrice) {
                setCurrentPriceClass(getCurrentPriceClass(response.data.currentPrice, response.data.previousClose))
                setDailyData(response.data)
                currentPrice = parseFloat(response.data.currentPrice)
                currentVolumne = parseInt(response.data.currentVolumne)
                setMessage('')
                setDataDivClass('show')
            } else {
                setMessage('Incorrect Stock Symbol : ' + symbol)
                setMessageClass('errorMessage')
                setDataDivClass('hide')
            }
        })
        .catch((error) => {
            setMessage('Error')
            setMessageClass('errorMessage')
            console.log(error)
        })  

        // Get Stock Trend
        api.getStockTrend(symbol)
        .then((response)=>{
            setResponseData(response.data)
            setRecommendation(calculateGetRecommendation(parseFloat(response.data.closingPriceBefore7Days)
                                                       , parseFloat(response.data.last7DaysAvgVolume)))            
            setMessage('')
            console.log(response)
        })
        .catch(() => {
            console.log('Error')
        })      
    }

    return (
        <div>
            <h1>Market Guru</h1>
            <form onSubmit={fetchData}>
                <h3>
                    <label htmlFor="symbol">Stock symbol&nbsp;
                        <input
                            required
                            name="symbol"
                            id="symbol"
                            type='text'
                            placeholder='MSFT'
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                        />
                    </label>
                    <button type='submit'>Submit</button>
                </h3>
            </form>  
            <p className={messageClass}>{message}</p>
            <div className={dataDivClass}>              
                <h3>Symbol : {dailyData ? dailyData.symbol : ''}</h3>
                <h3 className={recommendationClass}>Recommendation : {Recommendation}</h3>

                <h3 className={currentPriceClass}>Current Price : {dailyData ? dailyData.currentPrice : ''}</h3>
                <h3>High Price : {dailyData ? dailyData.highPrice : ''}</h3>
                <h3>Low Price : {dailyData ? dailyData.lowPrice : ''}</h3>
                <h3>Previous Close : {dailyData ? dailyData.previousClose : ''}</h3>
                <h3>Latest Trading Day : {dailyData ? dailyData.latestTradingDay : ''}</h3>
                
                <h3>Past Trend</h3>
                <LineChart
                    width={900}
                    height={500}
                    data={responseData.closingPrices}
                    margin={{ top: 50, right: 20, left: 10, bottom: 5 }}
                    >
                    <YAxis tickCount={10} type="number" width={80}>
                        <Label value="Closing Price" position="insideLeft" angle={270} />
                    </YAxis>

                    <Tooltip />

                    <XAxis padding={{left: 5, right: 5}} tickCount={10} angle={-60} height={90} dataKey="date">
                        <Label value="Date" position="insideBottom"/>
                    </XAxis>

                    <Line type="monotone" dataKey="close" stroke="#ff7300" yAxisId={0} />
                </LineChart>            
            </div>
        </div>
    )
}

export default IndexPage