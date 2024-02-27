console.log("Core JavaScript logic loaded.");

const urlParams = new URLSearchParams(window.location.search);
const latitude = parseFloat(urlParams.get('lat')) || 51.505;
const longitude = parseFloat(urlParams.get('lon')) || -0.09;

var map = L.map('main').setView([latitude, longitude], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

L.marker([latitude, longitude]).addTo(map);
