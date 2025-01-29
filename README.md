# Weather App

This was an independently developed project using HTML, CSS, and JavaScript to familiarize myself with these languages. 

I just started learning HTML, CSS, and JS within the last week and this project helped to put together the skills I learned, further refine them, and learn more. 

## Features 

- Search for cities from across the world. The search tab loads in searches based on the typed prefix.
- Display current temperature and conditions.
- View todays temperatures and conditions (12am, 6am, 12pm, 6pm, 12am).
- View the upcoming weeks weather report including the high and low temperature of each day, and the average conditioins.
- Displays to show when info was last updated.
- Switch to a new city via search.
- Toggle between celsius and farenheit.

## API Usage

The app uses 2 APIs:
- One to collect a list of cities based on a users search (including the cities coordinates).
- The other to collect weather data of the selected city via the coordinates acquired.

Both these APIs are available in the RapidAPI Marketplace and both are FREE. The API calls are at the bottom of the JS file and it is clearly marked where to insert your own API key if you would like to test the app. 

To acquire the keys: 
1. Go to RapidAPI.com. 
2. Search GeoDB Cities.
3. Subscribe to their free plan (up to 1000 requests per day).
4. Search WeatherAPI.com.
5. Subscribe to the MEGA plan. This plan does require a credit card to access but it is free (up to 500 requests per day).
6. Insert your API Keys into the clearly marked `API_KEY_CITIES` and `API_KEY_WEATHER` variables near the bottom of the app.js file.

You are now ready to test and play around with the app as you please! 


   
