const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    // Send the modified HTML file
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

app.get('/weather', function(req, res) {
    const city = req.query.city;
    const apiKey = 'bcec02221e31ff3db4a5505b4ad92298';
    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    //OpenWeather API
    axios.get(openWeatherUrl)
        .then(response => {
            const weatherdata = response.data;

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

            //Sunrise-Sunset API
            axios.get(sunriseSunsetUrl)
                .then(sunriseSunsetResponse => {
                    const sunrise = new Date(sunriseSunsetResponse.data.results.sunrise);
                    const sunset = new Date(sunriseSunsetResponse.data.results.sunset);

                    //USGS Earthquake API
                    const usgsEarthquakeUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`;
                    axios.get(usgsEarthquakeUrl)
                        .then(response => {
                            const earthquakes = response.data.features;
                            let daysSinceLastEarthquake = 0;

                            const relevantEarthquakes = earthquakes.filter(earthquake => {
                                const latDiff = Math.abs(coordinates.lat - earthquake.geometry.coordinates[1]);
                                const lonDiff = Math.abs(coordinates.lon - earthquake.geometry.coordinates[0]);
                    
                                return earthquake.properties.mag > 3 && latDiff <= 1 && lonDiff <= 1;
                            });

                            if (relevantEarthquakes.length > 0) {
                                const mostRecentEarthquake = new Date(relevantEarthquakes[0].properties.time);
                                const currentDate = new Date();
                                daysSinceLastEarthquake = Math.floor((currentDate - mostRecentEarthquake) / (1000 * 60 * 60 * 24));
                            }

                            let earthquakeMessage;
                            if (daysSinceLastEarthquake > 0) {
                                earthquakeMessage = `<p>The last earthquake near ${city} with magnitude over 3 occurred ${daysSinceLastEarthquake} days ago.</p>`;
                            } else {
                                earthquakeMessage = `<p>No earthquakes with magnitude over 3 ${city} in a very long time!</p>`;
                            }

                            //send response
                            res.send(`
                                <div class="weather-info">
                                    <p>Temperature in ${city} is ${temp} degrees Celsius.</p>
                                    <p>The weather is currently ${description}.</p>
                                    <p>It feels like ${feelsLike} degrees Celsius.</p>
                                    <p>Coordinates: ${coordinates.lon}, ${coordinates.lat}
                                    <p>Humidity: ${humidity}%</p>
                                    <p>Wind Speed: ${windSpeed} m/s</p>
                                    <p>Country Code: ${countryCode}</p>
                                    <p>Rain Volume: ${rainVolume} mm</p>
                                    <img src=${iconurl} alt="Weather Icon">
                                </div>
                                
                                <a href="/map?lat=${coordinates.lat}&lon=${coordinates.lon}">View Map</a>
                                
                                <div class="APIs-info">
                                    ${earthquakeMessage}
                                    <p>Sunrise: ${sunrise.toLocaleTimeString()}</p>
                                    <p>Sunset: ${sunset.toLocaleTimeString()}</p>
                                </div>
                            `);
                    }) //error handling
                    .catch(earthquakeError => {
                        console.error('Error fetching earthquake data from USGS API:', earthquakeError);
                        res.send('Error fetching earthquake data');
                    })
            .catch(sunriseSunsetError => {
                console.error('Error fetching sunrise/sunset data from Sunrise-Sunset API:', sunriseSunsetError);
                res.send('Error fetching sunrise/sunset data');
            })
    })
    .catch(error => {
        console.error('Error fetching data from OpenWeather API:', error);
        res.send('Error fetching data from OpenWeather API');
    });
});
});

//map
app.get('/map', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

app.listen(3000, function () {
    console.log('Server is running on port 3000');
});
