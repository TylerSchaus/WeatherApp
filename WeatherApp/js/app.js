
/* Program variables */
const searchContainer = document.getElementById('search-container');
const mainTemperature = document.getElementById('main-temperature');
const mainTemperateUnit = document.getElementById('main-temperature-unit');
const celsiusTag = document.getElementById('C');
const farenheitTag = document.getElementById('F');
const toggleSwitch = document.getElementById('toggle-switch');
toggleSwitch.addEventListener('change', toggleTemperature);
const dailyTemperaturesDisplay = document.querySelectorAll('ul#daily-temperatures li');
const weeklyTemperaturesDisplay = document.querySelectorAll('.row');
const displayArea = document.getElementById('search-list');
const searchInput = document.getElementById('search-input');

var currentUnit = 0;
let citiesMap = new Map();

/* UI updates */

/* This is used to toggle the search screen on and off, resets defaults to ensure nothing is left open upon reload. */
function toggleSearch() {
    if (!searchContainer.classList.contains('visible')) {
        searchContainer.classList.add('visible');
        setTimeout(() => {
            searchInput.value = '';
            displayArea.innerHTML = ''; // Clear search results on any open or close of screen.
        }, 500);
    } else {
        searchContainer.classList.toggle('visible');
        setTimeout(() => {
            searchInput.value = '';
            displayArea.innerHTML = ''; // Clear search results on any open or close of screen.
        }, 500);
    }
}

/* This function is used to toggle temperature units across all componenets of the display. 
   We store the current unit via a binary value (0 for celsius, 1 for farenheit) to make checking the current status easier. */
function toggleTemperature() {
    if (currentUnit == 1) {
        celsiusTag.style.opacity = 1;
        farenheitTag.style.opacity = 0.5;
        mainTemperature.textContent = farenheitToCelsius(parseInt(mainTemperature.textContent));
        mainTemperateUnit.textContent = '°C';
        dailyTemperaturesDisplay.forEach(item => {
            item.textContent = farenheitToCelsius(parseInt(item.textContent.substring(0, item.textContent.length - 1).trim())) + '°';
        });
        weeklyTemperaturesDisplay.forEach(item => {
            var temps = extractTemps(item.querySelector('.degree').textContent);
            var tempLow = farenheitToCelsius(temps.lowTemp); 
            var tempHigh = farenheitToCelsius(temps.highTemp);
            item.querySelector('.degree').textContent = 'L: '+tempLow+'° - H: '+tempHigh+'°';
        });
        currentUnit = 0;
    }
    else {
        celsiusTag.style.opacity = 0.5;
        farenheitTag.style.opacity = 1;
        mainTemperature.textContent = celsiusToFarenheit(parseInt(mainTemperature.textContent));
        mainTemperateUnit.textContent = '°F';
        dailyTemperaturesDisplay.forEach(item => {
            item.textContent = celsiusToFarenheit(parseInt(item.textContent.substring(0, item.textContent.length - 1).trim())) + '°';
        });
        weeklyTemperaturesDisplay.forEach(item => {
            var temps = extractTemps(item.querySelector('.degree').textContent);
            var tempLow = celsiusToFarenheit(temps.lowTemp); 
            var tempHigh = celsiusToFarenheit(temps.highTemp);
            item.querySelector('.degree').textContent = 'L: '+tempLow+'° - H: '+tempHigh+'°';
        });
        currentUnit = 1;
    }
}

// Simple method to call all UI update methods. 
// This is also where we fetch the weather data from the API as we don't need to fetch data until a user selects a city from the list. 
async function updateUI(cityName) {

    var weeklyTemperatures = await fetchForecastWeather(citiesMap.get(cityName).lat, citiesMap.get(cityName).lon);
    updateUpperUI(cityName, weeklyTemperatures);

    updateMiddleUI(weeklyTemperatures);

    updateLowerUI(weeklyTemperatures);

    toggleSearch();
}

/* Updates the upper section of the display.  */
async function updateUpperUI(cityName, weeklyTemperatures) {
    // Setting city and country elements in UI. 
    const cityDisplay = document.getElementById('city-display');
    const countryDisplay = document.getElementById('country-display');
    cityDisplay.textContent = cityName;
    countryDisplay.textContent = citiesMap.get(cityName).country;

    // Updating the image behind the current temperature to accuately reflect the current weather condition.
    const currentConditionImage = document.getElementById('main-weather-image');
    var currentConditionImageSrc = getConditionImage(weeklyTemperatures.current.condition.text, weeklyTemperatures.current.cloud);
    currentConditionImage.src = `./res/${currentConditionImageSrc}`;

    // Setting main weather elements in UI.
    if (currentUnit == 0) {
        mainTemperature.textContent = Math.round(weeklyTemperatures.current.temp_c);
    }
    else {
        mainTemperature.textContent = Math.round(weeklyTemperatures.current.temp_f);
    }

    // Setting today's date in UI.
    const todayDateDisplay = document.getElementById('today-date-display');
    var dateString = weeklyTemperatures.forecast.forecastday[0].date + 'T00:00';
    var date = new Date(dateString); 
    var formattedDate = (date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })).toUpperCase();
    todayDateDisplay.textContent = formattedDate;
}

// Updates the middle section of the display. 
function updateMiddleUI(weeklyTemperatures) {
    var startTime = 0; // Used to track the start time of each day's forecast and update as well load the hourly (every 6 hours for this app) weather.
    var hourlyTemperatures = weeklyTemperatures.forecast.forecastday[0].hour;
    dailyTemperaturesDisplay.forEach(item => {
        if (currentUnit == 0) {
            if (startTime != 24){
                item.textContent = Math.round(hourlyTemperatures[startTime].temp_c) + '°';
            }
            else {
                item.textContent = Math.round(weeklyTemperatures.forecast.forecastday[1].hour[0].temp_c) + '°'; // Because our daily display shows 12am -> todays midnight, we need to access the following day's weather report to get the midnight value.
            }
        }
        else {
            if (startTime != 24){
                item.textContent = Math.round(hourlyTemperatures[startTime].temp_f) + '°';
            }
            else {
                item.textContent = Math.round(weeklyTemperatures.forecast.forecastday[1].hour[0].temp_f) + '°';
            }
        }
        startTime += 6;
    });
    startTime = 0;

    /* Update symbols that represent conditions throughout the current day. */
    const dailySymbols = document.querySelectorAll('ul#daily-symbols li img');
    dailySymbols.forEach(item => {
        if (startTime == 24) {
            item.src = `./res/${getConditionImage(weeklyTemperatures.forecast.forecastday[1].hour[0].condition.text, weeklyTemperatures.forecast.forecastday[1].hour[0].cloud)}`; // Same as with temperature above.
        }
        else {
            item.src = `./res/${getConditionImage(hourlyTemperatures[startTime].condition.text, hourlyTemperatures[startTime].cloud)}`;
        }
        startTime += 6;
    });

}

/* Update lower (weekly report) componenet of UI */
async function updateLowerUI(weeklyTemperatures) {

    // Loop through each day's forecast and update the weekly report.
    for (var i = 1; i < 8; i++){
        /* Adding dates */
        var currentDay = weeklyTemperatures.forecast.forecastday[i];
        var dateString = currentDay.date + 'T00:00';
        var date = new Date(dateString);  // Convert the string to a Date object
        var formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        var iDateDisplay = weeklyTemperaturesDisplay[i-1].querySelector('.date'); 
        iDateDisplay.textContent = formattedDate;

        /* Update temperature ranges */
        var tempRange = weeklyTemperaturesDisplay[i-1].querySelector('.degree'); 
        if (currentUnit == 0) {
            tempRange.textContent = 'L: '+Math.round(currentDay.day.mintemp_c) + '° - H: '+Math.round(currentDay.day.maxtemp_c) + '°';
        }
        else {
            tempRange.textContent = 'L: '+Math.round(currentDay.day.mintemp_f) + '° - H: '+Math.round(currentDay.day.maxtemp_f) + '°';
        }

        /* Update symbol for conditions of each day */
        var iImage = weeklyTemperaturesDisplay[i-1].querySelector('.row-icon');
        iImage.src = `./res/${getConditionImage(weeklyTemperatures.forecast.forecastday[i].day.condition.text, weeklyTemperatures.forecast.forecastday[i].day.cloud)}`;
    }

    // Update footer to show when forecast was last updated.
    const lastUpdated = document.getElementById('last-updated');
    lastUpdated.textContent = `Last updated: ${weeklyTemperatures.current.last_updated} PST`;
}

// Function to add search results to the UI after retrieved from the API. 
function addCitiesToSearch(city) {

    displayArea.innerHTML = '';

    delay = 0;
    citiesMap.forEach((value, key, map) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${key}, ${value.country}`;
        listItem.addEventListener('click', () => {
            updateUI(key);
        });

        setTimeout(() => {
            displayArea.appendChild(listItem);
            triggerListItemAnimation(listItem);
        }, delay);

        delay += 250;
    });
}


/* General Functoins */
 
function farenheitToCelsius(farenheit) {
    return Math.round((farenheit - 32) * 5 / 9);
}

function celsiusToFarenheit(celsius) {
    return Math.round(celsius * 9 / 5 + 32);
}

function triggerListItemAnimation(listItem) {
    listItem.classList.remove('active');

    listItem.classList.add('active');

}

// Extract numeric values from the temperature range string so we can manipulate them for unit conversion. 
function extractTemps(tempString) {
    const matches = tempString.match(/-?\d+/g);
    if (matches && matches.length >= 2) {
        const lowTemp = parseInt(matches[0], 10);
        const highTemp = parseInt(matches[1], 10);
        return { lowTemp, highTemp };
    } else {
        throw new Error("Invalid temperature string");
    }
}

// Get the appropriate condition image based on the current weather and cloud coverage. 
function getConditionImage(currentWeather, cloud) {
    currentWeather = currentWeather.toLowerCase();
    switch (currentWeather) {
        case 'partly cloudy':
            if (cloud > 70) {
                return 'cloudy.png';
            }
            return 'Partly-cloudy.png';
        case 'cloudy':
        case 'overcast':
            return 'cloudy.png';
        case 'sunny':
            return 'sun.png';
        default:
            if (currentWeather.includes('rain')) {
                if (cloud < 40){
                    return 'rain-sun.png';
                }
                return 'rain.png';
            }
            else if (currentWeather.includes('snow')) {
                return 'snow.png';
            }
            return 'Partly-cloudy.png'; // Default to partly cloudy if no match found.
    }
}

// Get current date in the format 'YYYY-MM-DD'. 
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return formattedDate;
}

function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

/* Main Data Calls */

// Called when user clicks search, this is where we call the fetch method to the API.
async function setCityList() {
    const prefix = searchInput.value;
    const result = await fetchCities(prefix);
    const data = result.data;

    citiesMap.clear();
    if (Array.isArray(data)) {
        data.forEach(item => {
            citiesMap.set(item.city, {
                country: item.country,
                lat: item.latitude,
                lon: item.longitude,
            });

        });
    }
    else {
        console.log('No data found or wrong format recieved');
    }

    addCitiesToSearch();
}

/* API Requests */

// API Keys should be replaced with your own API keys. You can get them from the following links:
// https://rapidapi.com/weatherapi/api/weatherapi-com - For weather.
// https://rapidapi.com/wirefreethought/api/geodb-cities - For city data.
// Both are free but the weather API key requires a credit card (the MEGA plan on their subscription options).

const API_KEY_CITIES = 'INSERT_YOUR_OWN_API_KEY'; 
const API_KEY_WEATHER = 'INSERT_YOUR_OWN_API_KEY';

async function fetchCities(prefix) {
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?types=CITY&minPopulation=50000&namePrefix=${prefix}&limit=10`; /* Prefix is the only variable for our API request here. 10 results is max per the free plan. */
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY_CITIES,
            'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function fetchForecastWeather(latitude, longitude) {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${latitude}%2C${longitude}&days=8&lang=true`; /* Fetches the current day + 7 days ahead (sufficient for our app). Needs the longitude and latitude of the city. lang = true allows us to recieve text desciptions of conditions (used for image selection). */
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY_WEATHER,
            'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}
