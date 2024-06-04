import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch('/api/hotels')
      .then(response => response.json())
      .then(data => setHotels(data))
      .catch(error => console.error('Error fetching hotels:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hotels</h1>
        {hotels.length === 0 ? (
          <p>Loading hotels...</p>
        ) : (
          <ul>
            {hotels.map(hotel => (
              <li key={hotel.hotel_id}>
                <h2>{hotel.name}</h2>
                <p>{hotel.address}</p>
                <p>{hotel.phone}</p>
                <p>{hotel.email}</p>
                <p>{hotel.overview}</p>
                <p>Price per Night: ${hotel.price_per_night}</p>
                <p>Available People Count: {hotel.available_people_count}</p>
                <p>Available Night Count: {hotel.available_night_count}</p>
                <p>Room Type: {hotel.room_type}</p>
              </li>
            ))}
          </ul>
        )}
      </header>
    </div>
  );
}

export default App;