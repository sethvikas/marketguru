import axios from 'axios'
import configData from './config.json'

const API_KEY = configData.API_KEY

const instance = axios.create({
    baseURL: configData.BASE_URL,
});

export default {
    getStockDetails: (symbol) =>
    instance({
        'method':'GET',
        'url':'/query',
        'params': {
            'function':'GLOBAL_QUOTE',
            'symbol': symbol.toUpperCase(),
            'apikey': API_KEY
        },
        transformResponse: [function (data) {
            // Parse response data
            const json = JSON.parse(data)
            
            const symbol = json['Global Quote']?json['Global Quote']['01. symbol']:''
            const latestTradingDay = json['Global Quote']?json['Global Quote']['07. latest trading day']:''
            const highPrice = json['Global Quote']?json['Global Quote']['03. high']:''
            const lowPrice = json['Global Quote']?json['Global Quote']['04. low']:''
            const currentPrice = json['Global Quote']?json['Global Quote']['05. price']:''
            const currentVolumne = json['Global Quote']?json['Global Quote']['06. volume']:''
            const previousClose = json['Global Quote']?json['Global Quote']['08. previous close']:''
            const note = json['Note']
    
            data = {
                symbol,
                latestTradingDay,
                currentPrice,
                highPrice,
                lowPrice,
                previousClose,
                currentVolumne,
                note
            }
    
            return data;
        }],
    }), 

    getStockTrend: (symbol) =>
    instance({
        'method':'GET',
        'url':'/query',
        'params': {
            'function':'TIME_SERIES_DAILY',
            'symbol': symbol.toUpperCase(),
            'apikey': API_KEY
        },
        transformResponse: [function (data) {
            // Parse response data
            const json = JSON.parse(data)

            const closingDates = Object.keys(json['Time Series (Daily)'])
            const closingDatesReversed = Object.keys(json['Time Series (Daily)']).reverse()
            //console.log(closingDates)
            const closingPrices = closingDatesReversed.map(date => date = {
                date,
                close: Number(json['Time Series (Daily)'][date]['4. close'])
            })

            let totalVolume = 0;
            let last7DaysAvgVolume = 0;

            // Get total volumne for last 7 days
            for (let i = 0; i < 7; i++) {
                totalVolume += parseInt(json['Time Series (Daily)'][closingDates[i]]['5. volume'])
            }
            
            // Get average volume for last 7 days
            last7DaysAvgVolume = parseInt(totalVolume/7)

            // Get closing price before 7 days
            let closingPriceBefore7Days = parseInt(json['Time Series (Daily)'][closingDates[7]]['4. close'])

            data = {
                closingPrices,
                last7DaysAvgVolume,
                closingPriceBefore7Days
            }
    
            return data;
        }],
    }),   
}