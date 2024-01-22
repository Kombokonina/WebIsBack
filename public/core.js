// public/core.js

// Your core JavaScript logic here
console.log("Core JavaScript logic loaded.");

// Example Leaflet usage
// Extract latitude and longitude from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const latitude = parseFloat(urlParams.get('lat')) || 51.505; // Default to London if not provided
const longitude = parseFloat(urlParams.get('lon')) || -0.09; // Default to London if not provided

var map = L.map('map').setView([latitude, longitude], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

L.marker([latitude, longitude]).addTo(map);
