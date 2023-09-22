import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import moment from "moment-timezone";
import tzlookup from 'tz-lookup';


// Import the loadLocationData function
// Adjust the path as needed


let weatherData;
let error;
let currentHour = null;
let globalReq;
let globalRes;
// Function to convert UNIX timestamp to local time
function convertToLocationTime(unixTimestamp, timezoneOffsetSeconds) {
    const localTimestamp = unixTimestamp + timezoneOffsetSeconds;
    const date = new Date(localTimestamp * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;

}

const fetchWeatherData = async(req,res)=>{
    weatherData = {};
    const apiKey = process.env.SECRET_API_KEY;
    let apiUrl;
    let apiUrl1;
    if(req.body.latitude && req.body.longitude){
        const latitude = req.body.latitude;
        const longitude = req.body.longitude;
        const timezone = tzlookup(latitude, longitude);
        weatherData['time'] = moment().tz(timezone).format('hh:mm A');
        currentHour = moment().tz(timezone).format('HH');
        weatherData['date'] = moment().tz(timezone).format('ddd, DD MMMM');
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        apiUrl1 = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    }else if(req.body.location){
        try {
            const city = req.body.location;
            apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
            const coords = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;
            const response = await axios.get(coords);
        
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const latitude = response.data[0].lat;
                const longitude = response.data[0].lon;
                const timezone = tzlookup(latitude, longitude);
                weatherData['time'] = moment().tz(timezone).format('hh:mm A');
                currentHour = parseInt(moment().tz(timezone).format('HH'));
                weatherData['date'] = moment().tz(timezone).format('ddd, DD MMMM');
        
                apiUrl1 = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
            } else {
                // Send an error response back to the client
                weatherData = null;
                error = "⚠️ Enter correct location";
                return res.redirect("/");
                
            }
        } catch (error) {
            weatherData = null;
            console.log(error);
            // Send an error response back to the client
            error = "⚠️ Enter correct location";
            return res.redirect("/");
        }
        
        
    }
    return {apiUrl,apiUrl1};
}

const handleLocationRoute = async(req,res)=>{
    const { apiUrl,apiUrl1 } = await fetchWeatherData(req,res);

    try{
        const response = await axios.get(apiUrl);
        const response1 = await axios.get(apiUrl1);
        weatherData['name'] = response.data.name;
        weatherData['temp'] = Math.round(response.data.main.temp);
        weatherData['description'] = response.data.weather[0].description;
        weatherData['sunriseTime'] = convertToLocationTime(response.data.sys.sunrise,response.data.timezone);
        weatherData['sunsetTime'] = convertToLocationTime(response.data.sys.sunset, response.data.timezone);
        weatherData['humidity'] = response.data.main.humidity;
        weatherData['feels_like'] = Math.round(response.data.main.feels_like);
        weatherData['cloudiness'] = response.data.clouds.all;
        weatherData['aqi'] = response1.data.list[0].main.aqi;
        
        const id = response.data.weather[0].id;
        let weatherMessage = null;
        let icon = null;

        //checking for the sunset
        const sunriseHour = parseInt(weatherData.sunriseTime.split(':')[0]);
        const sunsetHour = parseInt(weatherData.sunsetTime.split(':')[0]);
        
        if(id === 800){
            if(sunriseHour < currentHour && currentHour < sunsetHour){
                weatherMessage = "Clear skies ahead – it's a great day to soak up the sun!";
                icon = 'day.svg';
            }
            else{
                weatherMessage="Clear skies tonight – it's a perfect time to enjoy the stars!";
                icon = 'night.svg';
            }
        }
        else if(id === 801 || id === 802){
            if(sunriseHour < currentHour && currentHour < sunsetHour){
                weatherMessage = "Partly cloudy skies, a perfect time for outdoor 🏕️ adventures!";
                icon = 'cloudy-day-1.svg';
            }
            else{
                weatherMessage="Partly clear skies tonight, a perfect time for stargazing ⭐ and outdoor adventures!";
                icon = 'cloudy-night-1.svg';
            }
        }
        else if(id === 803){
            if(sunriseHour < currentHour && currentHour < sunsetHour){
                weatherMessage = "Cloudy skies, but don't forget your sunscreen 🧴 just in case.";
                icon = 'cloudy-day-3.svg';
            }
            else{
                weatherMessage="Starry skies tonight, but don't forget to bring a jacket 🧥 for the cooler air.";
                icon = 'cloudy-night-3.svg';
            }
        }
        else if(id === 804){
            weatherMessage = "It's overcast today, so bring an umbrella ⛱️ for a possible drizzle.";
            icon ='cloudy.svg';
            
        }
        else if([500,501,502,503,504].includes(id)){
            if(sunriseHour < currentHour && currentHour < sunsetHour){
                weatherMessage = "Rainy day ahead, grab your umbrella ☔ and stay dry!";
                icon = 'rainy-3.svg';
            }
            else{
                weatherMessage="Rainy night ahead, grab your umbrella ☔ and stay dry!";
                icon = 'rainy-5.svg';
            }
        }else if([511,520,521,522,531].includes(id)){
            weatherMessage = "Showers on the horizon – keep that ☔ umbrella handy.";
            icon = 'rainy-7.svg';
        }
        else if([200,201,202,210,211,212,221,230,231,232].includes(id)){
            weatherMessage = "Thunderstorms ⚡ approaching – stay indoors and cozy.";
            icon = 'thunder.svg';
        }
        else if([600,601,602,611,612,613,615,616,620,621].includes(id)){
            weatherMessage = "Snowflakes ❄️ falling, time for winter fun and hot cocoa!";
            if(sunriseHour < currentHour && currentHour < sunsetHour){
                icon = 'snowy-3.svg';
            }
            else{
                icon = 'snowy-4.svg';
            }

        }
        else if(id === 622){
            weatherMessage = "A blizzard warning! Stay indoors and stay warm.";
            icon = 'snowy-6.svg';
        }
        else if(id === 781){
            weatherMessage = "Tornado 🌪️ warning! Seek shelter immediately.";
            icon = 'tornado.svg';
        }
        else{
            weatherMessage = "Enjoy the day, no matter the weather!";
            icon = 'weather.svg';
        }
        
        weatherData['message'] = weatherMessage;
        weatherData['icon'] = icon;

    error = null;
    console.log(weatherData);
    if (!res.headersSent) {
        return res.redirect("/location");
    } else {
        console.log("Headers already sent. Response cannot be sent again.");
    }
    }catch(error){
        console.log("Error");
        console.log(error);
        
    }
}

const app = express();
const port = 3000;
dotenv.config();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));


app.get("/", (req,res)=>{
    res.render("index.ejs",{content: weatherData, errorMessage: error });
})

app.get("/location", (req, res) => {
        res.render("index.ejs", { content: weatherData });
    
});


app.post("/location", async (req,res)=>{
    globalReq = req;
    globalRes = res;
    try{
        await handleLocationRoute(req,res);
    }catch(error){
        console.log(error);
    }
})

// ...

// Use setInterval to periodically execute handleLocationRoute
setInterval(async () => {
    try {
        if(globalReq && globalRes){
            await fetchWeatherData(globalReq, globalRes);
            await handleLocationRoute(globalReq,globalRes);
            console.log('handleLocationRoute executed successfully.');
        } 
    } catch (error) {
        console.error('Error executing handleLocationRoute:', error);
    }
}, 30000); // 30,000 milliseconds (30 seconds)


app.listen(port, (req,res)=>{
    console.log(`server running on the port ${port}`);
})