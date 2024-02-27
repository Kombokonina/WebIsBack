const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const axios = require('axios');
const Item = require('../models/item');

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.send('User already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
      res.redirect('/login');
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid username or password');
    }
    req.session.user = user;
    res.redirect('/weather');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/weatherInfo', (req, res) => { 
  res.render('weatherInfo');
});

router.get('/weather', (req, res) => {
  res.render('main');
});

router.post('/weather', function(req, res) {
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
                          
                          const weatherdata = {
                              temp: temp,
                              description: description,
                              feelsLike: feelsLike,
                              coordinates: coordinates,
                              humidity: humidity,
                              pressure: pressure,
                              windSpeed: windSpeed,
                              countryCode: countryCode,
                              rainVolume: rainVolume,
                              iconurl: iconurl,
                              earthquakeMessage: earthquakeMessage,
                              sunrise: sunrise,
                              sunset: sunset
                          };
                          
                          res.render('weatherInfo', { weatherdata: weatherdata });
                          
                          

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
router.get('/map', function (req, res) {
  res.render('main');
});

router.get('/main', async (req, res) => {
  try {
      const items = await Item.find().sort({ createdAt: -1 });
      res.render('index', { items });
  } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).send('Internal Server Error');
  }
});

const isAdmin = (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
      return res.status(403).send('Access denied');
  }
  next();
};

router.get('/admin', isAdmin, async (req, res) => {
  try {
      const items = await Item.find();
      res.render('admin', { items });
  } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Route for adding a new item
router.post('/addItem', isAdmin, async (req, res) => {
  try {
      const { pictures, names, descriptions } = req.body;

      const parsedNames = names.split(',').map(name => ({ name }));
      const parsedDescriptions = descriptions.split(',').map(description => ({ description }));

      const newItem = new Item({
          pictures: pictures.split(',').map(url => url.trim()), 
          names: parsedNames, 
          descriptions: parsedDescriptions
      });

      await newItem.save();
      res.redirect('/admin'); 
  } catch (error) {
      console.error('Error adding item:', error);
      return res.status(500).send('Error adding item: ' + error.message); 
  }
});


// Route for updating an existing item
router.post('/admin/updateItem/:itemId', isAdmin, async (req, res) => {
  try {
      const { itemId } = req.params;
      const { pictures, names, descriptions } = req.body;

      const parsedNames = names.split(',').map(name => ({ name }));
      const parsedDescriptions = descriptions.split(',').map(description => ({ description }));

      const updatedItem = {
          pictures: pictures.split(','), 
          names: parsedNames, 
          descriptions: parsedDescriptions 
      };
      await Item.findByIdAndUpdate(itemId, updatedItem);
      res.redirect('/admin'); 
  } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Route for deleting an item
router.post('/admin/deleteItem/:itemId', isAdmin, async (req, res) => {
  try {
      const { itemId } = req.params;
      await Item.findByIdAndDelete(itemId);
      res.redirect('/admin'); 
  } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).send('Internal Server Error');
  }
});

module.exports = router;