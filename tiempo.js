// tiempo.js

import { loadHeader } from './app.js';
import { initializeHeader } from './header.js';

// --- CONFIGURACIÓN ---
const API_KEY = '2aa2c3ddc82e560cf10c862239aadcd9'; 

const LOCATIONS = {
    motril: { lat: 36.746, lon: -3.520, name: 'Motril' },
    salobrena: { lat: 36.744, lon: -3.585, name: 'Salobreña' },
    almunecar: { lat: 36.733, lon: -3.691, name: 'Almuñécar' }
};

// --- ELEMENTOS DEL DOM ---
const loadingElement = document.getElementById('loading-weather');
const weatherDataElement = document.getElementById('weather-data');
const errorElement = document.getElementById('error-message');
const currentWeatherElement = document.getElementById('current-weather');
const hourlyForecastElement = document.getElementById('hourly-forecast');
const dailyForecastElement = document.getElementById('daily-forecast');
const comarcaWeatherElement = document.getElementById('comarca-weather');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carga el header
    await loadHeader();
    
    // ✅ 2. Inicializa la lógica de la cabecera
    initializeHeader();
    
    if (API_KEY === 'TU_API_KEY_AQUI') {
        showError("Por favor, introduce una API Key válida en el archivo `tiempo.js`.");
        return;
    }
    
    loadAllWeatherData();
});


// --- LÓGICA PRINCIPAL ---

async function loadAllWeatherData() {
    try {
        const { lat, lon } = LOCATIONS.motril;

        // ✅ MODIFICADO: Usamos dos endpoints gratuitos en paralelo
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok) throw new Error(`Error en API de tiempo actual: ${currentResponse.statusText}`);
        if (!forecastResponse.ok) throw new Error(`Error en API de pronóstico: ${forecastResponse.statusText}`);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        // Renderizamos todo con los nuevos datos
        renderCurrentWeather(currentData);
        renderHourlyForecast(forecastData.list);
        renderDailyForecast(forecastData.list);
        
        loadComarcaWeather();

        loadingElement.classList.add('hidden');
        weatherDataElement.classList.remove('hidden');

    } catch (error) {
        console.error("Error al obtener datos del tiempo:", error);
        showError(error.message);
    }
}

async function loadComarcaWeather() {
    const promises = [
        getCurrentWeatherFor(LOCATIONS.salobrena),
        getCurrentWeatherFor(LOCATIONS.almunecar)
    ];
    const results = await Promise.all(promises);
    comarcaWeatherElement.innerHTML = results.join('');
}

async function getCurrentWeatherFor(location) {
    try {
        const { lat, lon, name } = location;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        const response = await fetch(url);
        if (!response.ok) return '';
        const data = await response.json();
        
        return `
            <div class="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
                <h3 class="font-bold text-lg">${name}</h3>
                <div class="text-right">
                    <p class="font-bold text-2xl">${Math.round(data.main.temp)}°C</p>
                    <p class="text-gray-500 text-sm capitalize">${data.weather[0].description}</p>
                </div>
                 <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="w-12 h-12">
            </div>
        `;
    } catch (error) {
        console.error(`Error cargando tiempo para ${location.name}:`, error);
        return '';
    }
}

// --- FUNCIONES DE RENDERIZADO ---

// ✅ MODIFICADO: Adaptado para la estructura de datos del endpoint /weather
function renderCurrentWeather(data) {
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    currentWeatherElement.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-start">
            <div>
                <h1 class="text-3xl font-bold">El Tiempo en ${data.name}</h1>
                <p class="text-lg text-gray-500">Ahora mismo</p>
            </div>
            <div class="text-right mt-4 md:mt-0">
                <p class="text-gray-600 capitalize text-xl">${data.weather[0].description}</p>
            </div>
        </div>
        <div class="flex items-center justify-between mt-6">
            <div class="flex items-center">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}" class="w-24 h-24 -ml-4">
                <span class="text-6xl font-bold">${Math.round(data.main.temp)}°C</span>
            </div>
            <div class="text-right space-y-2 text-gray-600">
                <p>Sensación térmica: <strong>${Math.round(data.main.feels_like)}°</strong></p>
                <p>Humedad: <strong>${data.main.humidity}%</strong></p>
                <p>Viento: <strong>${(data.wind.speed * 3.6).toFixed(1)} km/h</strong></p>
            </div>
        </div>
        <div class="flex justify-between items-center text-gray-500 mt-6 pt-4 border-t">
            <span>Salida del sol: ${sunrise}</span>
            <span>Puesta del sol: ${sunset}</span>
        </div>
    `;
}

// ✅ MODIFICADO: Muestra las próximas 8 previsiones (24 horas en intervalos de 3h)
function renderHourlyForecast(hourlyList) {
    const next24Hours = hourlyList.slice(0, 8);
    hourlyForecastElement.innerHTML = next24Hours.map(hour => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="flex-shrink-0 bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center w-24">
                <p class="font-semibold text-sm">${time}</p>
                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="${hour.weather[0].description}" class="w-16 h-16 mx-auto">
                <p class="font-bold text-xl">${Math.round(hour.main.temp)}°C</p>
            </div>
        `;
    }).join('');
}

// ✅ MODIFICADO: Procesa la lista de 3 horas para mostrar un resumen por día
function renderDailyForecast(dailyList) {
    const dailyData = {};

    dailyList.forEach(item => {
        const date = new Date(item.dt * 1000).toISOString().slice(0, 10);
        if (!dailyData[date]) {
            dailyData[date] = {
                temps: [],
                icons: {},
                descriptions: {},
                humidity: []
            };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].humidity.push(item.main.humidity);
        
        // Contamos los iconos y descripciones para usar el más representativo del día
        const icon = item.weather[0].icon;
        const desc = item.weather[0].description;
        dailyData[date].icons[icon] = (dailyData[date].icons[icon] || 0) + 1;
        dailyData[date].descriptions[desc] = (dailyData[date].descriptions[desc] || 0) + 1;
    });

    dailyForecastElement.innerHTML = Object.keys(dailyData).slice(0, 5).map((date, index) => {
        const day = dailyData[date];
        const dateObj = new Date(date);
        dateObj.setUTCHours(12); // Evitar problemas de zona horaria

        const dayName = index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
        const maxTemp = Math.round(Math.max(...day.temps));
        const minTemp = Math.round(Math.min(...day.temps));
        const avgHumidity = Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length);
        
        const mainIcon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
        const mainDesc = Object.keys(day.descriptions).reduce((a, b) => day.descriptions[a] > day.descriptions[b] ? a : b);

        return `
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                <p class="font-bold w-1/4 capitalize">${dayName}</p>
                <div class="flex items-center w-1/4">
                    <img src="https://openweathermap.org/img/wn/${mainIcon}.png" alt="${mainDesc}" class="w-8 h-8 mr-2">
                    <span class="text-gray-600 hidden md:inline capitalize">${mainDesc}</span>
                </div>
                <p class="text-gray-500 w-1/4 text-center">Humedad: ${avgHumidity}%</p>
                <p class="font-semibold w-1/4 text-right">
                    <span class="text-gray-800">${maxTemp}°</span> / 
                    <span class="text-gray-500">${minTemp}°</span>
                </p>
            </div>
        `;
    }).join('');
}

function showError(message) {
    loadingElement.classList.add('hidden');
    weatherDataElement.classList.add('hidden');
    errorElement.classList.remove('hidden');
    errorElement.querySelector('p').textContent = message;
    console.error("Error mostrado al usuario:", message);
}