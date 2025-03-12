import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://api.open-meteo.com/v1/forecast";
const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const DEFAULT_CITIES = [
  { name: "Austin", lat: 30.2672, lon: -97.7431 },
  { name: "Dallas", lat: 32.7767, lon: -96.7970 },
  { name: "Houston", lat: 29.7604, lon: -95.3698 }
];

const WeatherApp = () => {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState([]);
  const [newCity, setNewCity] = useState("");
  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWeatherData(selectedCity.lat, selectedCity.lon);
  }, [selectedCity]);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `${API_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=auto`
      );
      const data = await response.json();
      const hourlyData = data.hourly.time
        .slice(13, 25)
        .map((time, index) => ({
          time: new Date(time).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          }),
          temp: data.hourly.temperature_2m[index + 13]
        }));
      setWeatherData(hourlyData);
      setError("");
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to load weather data.");
    }
  };

  const fetchCityCoordinates = async () => {
    try {
      const response = await fetch(`${GEO_API_URL}?name=${newCity}&count=1`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { latitude, longitude, name } = data.results[0];
        const cityExists = cities.some((city) => city.name === name);
        if (!cityExists) {
          const newCityData = { name, lat: latitude, lon: longitude };
          setCities([...cities, newCityData]);
          setSelectedCity(newCityData);
        }
      } else {
        setError(`Could not find weather for "${newCity}"`);
      }
    } catch (err) {
      setError("Error fetching city data.");
    }
  };

  return (
    <div style={{ border: "1px solid black", padding: "15px", width: "300px" }}>
      <div>
        {cities.map((city) => (
          <button
            key={city.name}
            onClick={() => setSelectedCity(city)}
            style={{
              backgroundColor: selectedCity.name === city.name ? "gray" : "lightgray",
              padding: "5px",
              margin: "5px",
              fontWeight: "bold"
            }}
          >
            {city.name}
          </button>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={fetchCityCoordinates}>+</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Temperature</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.time}</td>
              <td>{entry.temp} F</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeatherApp;
