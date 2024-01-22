const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.write('<form action="/weather" method="get">');
    res.write('<label for="city">Enter city:</label>');
    res.write('<input type="text" id="city" name="city" required>');
    res.write('<button type="submit">Get Weather</button>');
    res.write('</form>');

    // Add a link to the map page
    res.write('<a href="/map">View Map</a>');

    res.send();
});

app.get('/weather', function(req, res) {
    const city = req.query.city;
    const apiKey = 'bcec02221e31ff3db4a5505b4ad92298';
    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    axios.get(openWeatherUrl)
        .then(response => {
            const weatherdata = response.data;

            // Extract the necessary weather information
            const temp = weatherdata.main.temp;
            const description = weatherdata.weather[0].description;
            const feelsLike = weatherdata.main.feels_like;
            const coordinates = weatherdata.coord;
            const humidity = weatherdata.main.humidity;
            const pressure = weatherdata.main.pressure;
            const windSpeed = weatherdata.wind.speed;
            const countryCode = weatherdata.sys.country;
            const rainVolume = weatherdata.rain;
            const icon = weatherdata.weather[0].icon;
            const iconurl = `http://openweathermap.org/img/w/${icon}.png`;

            const sunriseSunsetUrl = `https://api.sunrise-sunset.org/json?lat=${coordinates.lat}&lng=${coordinates.lon}&formatted=0`;

            axios.get(sunriseSunsetUrl)
                .then(sunriseSunsetResponse => {
                    const sunrise = new Date(sunriseSunsetResponse.data.results.sunrise);
                    const sunset = new Date(sunriseSunsetResponse.data.results.sunset);

            res.write(`<p>Temperature in ${city} is ${temp} degrees Celsius.</p>`);
            res.write(`<p>The weather is currently ${description}.</p>`);
            res.write(`<p>It feels like ${feelsLike} degrees Celsius.</p>`);
            res.write(`<p>Coordinates: ${coordinates.lon}, ${coordinates.lat}</p>`);
            res.write(`<p>Humidity: ${humidity}%</p>`);
            res.write(`<p>Pressure: ${pressure} hPa</p>`);
            res.write(`<p>Wind Speed: ${windSpeed} m/s</p>`);
            res.write(`<p>Country Code: ${countryCode}</p>`);
            res.write(`<p>Rain Volume: ${rainVolume} mm</p>`);
            res.write(`<img src=${iconurl} alt="Weather Icon">`);

            res.write(`<a href="/map?lat=${coordinates.lat}&lon=${coordinates.lon}">View Map</a>`);
            

            res.write(`<p>Sunrise: ${sunrise.toLocaleTimeString()}</p>`);
            res.write(`<p>Sunset: ${sunset.toLocaleTimeString()}</p>`);
            res.send();
        })
        .catch(error => {
            console.error('Error fetching data from OpenWeather API:', error);
            res.send('Error fetching data from OpenWeather API');
        });
    });
});

app.get('/map', function (req, res) {
    res.sendFile(__dirname + '/public/map.html');
});

app.listen(3000, function () {
    console.log('Server is running on port 3000');
});
