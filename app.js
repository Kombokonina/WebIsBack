const express = require('express');
const axios = require('axios');
const path = require('path');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dbUrl = 'mongodb+srv://Kombokonina:kombokonina69@users.oxf09of.mongodb.net/?retryWrites=true&w=majority'


mongoose.connect(dbUrl).then(() => {
    console.info("Connected to the database");
})  .catch((err) => {
        console.log("Error: ", err)
});

const app = express();

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('views'));

app.use('/static', express.static(path.join(__dirname, 'views')));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.render('register');
});

/*
app.get('/', function (req, res) {
    res.redirect('/login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send('Invalid username or password');
      }
      req.session.user = user;
      res.redirect('/main');
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).send('Internal Server Error');
    }
});

app.get('/admin', (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
      return res.status(403).send('Access denied');
    }
});  


app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = new User({
        username,
        password: hashedPassword,
        isAdmin: false
      });
      await user.save();
      res.redirect('/login');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});
*/

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

                            const weatherInfo = {
                                temp: temp,
                                description: description,
                                feelsLike: feelsLike,
                                coordinates: coordinates.lon + ', ' + coordinates.lat,
                                humidity: humidity,
                                windSpeed: windSpeed,
                                countryCode: countryCode,
                                rainVolume: rainVolume,
                                iconurl: iconurl,
                                earthquakeMessage: earthquakeMessage,
                                sunrise: sunrise,
                                sunset: sunset
                            };

                            res.render('main', { weatherInfo: weatherInfo });

                            /*
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
                            */

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
    res.render('main');
});

app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000/');
});
