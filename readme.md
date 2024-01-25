# Weather App

## Overview

This is a simple weather application that provides weather information, sunrise/sunset times, and days since the last earthquake for a specified city.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Kombokonina/WebIsBack.git

2. Navigate to the project directory
    cd WebIsBack

3. Install dependencies
    npm install

4. Open app.js
    Replace OpenWeather Api Key if you have one.

### Usage

1. Start the server
    node app.js

2. Go to http:localhost:3000
    Enter city and click "Get Weather"

### APIs Used

OpenWeatherMap API: General weather.
Sunrise-Sunset API: Sunrise and sunset times.
USGS Earthquake API: Earthquake data.

### Design desicions

Project Structure: Uses Express.js for the server and static HTML files.

Weather API: Utilizes OpenWeatherMap for temperature, description, etc.

Sunrise/Sunset API: Uses the Sunrise-Sunset API for accurate times.

Earthquake API: Queries the USGS Earthquake API for earthquakes with magnitude over 3 near the specified city.

UI/UX: Simple interface with a form for city input and links for additional information.


### Thank you 