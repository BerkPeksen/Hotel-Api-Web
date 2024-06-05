import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [hotels, setHotels] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minNights, setMinNights] = useState('');
  const [minPeople, setMinPeople] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [nightsMin, setNightsMin] = useState('');
  const [peopleMin, setPeopleMin] = useState('');
  const [searchType, setSearchType] = useState(null);

  const fetchHotelsByAvailableNights = async () => {
    try {
      const response = await axios.get(`/api/hotels/available_nights`, {
        params: {
          min_nights: minNights,
        },
      });
      setHotels(response.data);
      setSearchType('available_nights');
    } catch (error) {
      console.error('Error fetching hotels by available nights', error);
    }
  };

  const fetchHotelsByAvailablePeopleCount = async () => {
    try {
      const response = await axios.get(`/api/hotels/available_people_count`, {
        params: {
          min_people_count: minPeople,
        },
      });
      setHotels(response.data);
      setSearchType('available_people_count');
    } catch (error) {
      console.error('Error fetching hotels by available people count', error);
    }
  };

  const fetchHotelsByPriceRange = async () => {
    try {
      const response = await axios.get(`/api/hotels/price_range`, {
        params: {
          min_price: priceMin,
          max_price: priceMax,
        },
      });
      setHotels(response.data);
      setSearchType('price_range');
    } catch (error) {
      console.error('Error fetching hotels by price range', error);
    }
  };

  const fetchHotelsByCombinedSearch = async () => {
    try {
      const response = await axios.get(`/api/hotels/search`, {
        params: {
          min_price: minPrice,
          max_price: maxPrice,
          min_nights: nightsMin,
          min_people: peopleMin,
        },
      });
      setHotels(response.data);
      setSearchType('combined_search');
    } catch (error) {
      console.error('Error fetching hotels by combined search', error);
    }
  };

  const handleButtonClick = (fetchFunction) => {
    if (searchType) {
      setSearchType(null);
      setHotels([]);
    } else {
      fetchFunction();
    }
  };

  return (
    <div className="App">
      <h1>Hotel Search</h1>

      <div className="search-section">
        <h2>Search by Available Nights</h2>
        <input
          type="number"
          placeholder="Min Nights"
          value={minNights}
          onChange={(e) => setMinNights(e.target.value)}
        />
        <button onClick={() => handleButtonClick(fetchHotelsByAvailableNights)}>
          {searchType === 'available_nights' ? 'Hide' : 'Show'} Hotels by Available Nights
        </button>
      </div>

      <div className="search-section">
        <h2>Search by Available People Count</h2>
        <input
          type="number"
          placeholder="Min People"
          value={minPeople}
          onChange={(e) => setMinPeople(e.target.value)}
        />
        <button onClick={() => handleButtonClick(fetchHotelsByAvailablePeopleCount)}>
          {searchType === 'available_people_count' ? 'Hide' : 'Show'} Hotels by Available People Count
        </button>
      </div>

      <div className="search-section">
        <h2>Search by Price Range</h2>
        <input
          type="number"
          placeholder="Min Price"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />
        <button onClick={() => handleButtonClick(fetchHotelsByPriceRange)}>
          {searchType === 'price_range' ? 'Hide' : 'Show'} Hotels by Price Range
        </button>
      </div>

      <div className="search-section">
        <h2>Search by Combined Parameters</h2>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Nights"
          value={nightsMin}
          onChange={(e) => setNightsMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min People"
          value={peopleMin}
          onChange={(e) => setPeopleMin(e.target.value)}
        />
        <button onClick={() => handleButtonClick(fetchHotelsByCombinedSearch)}>
          {searchType === 'combined_search' ? 'Hide' : 'Show'} Hotels by Combined Parameters
        </button>
      </div>

      {searchType && (
        <div className="results-section">
          <h2>Hotels</h2>
          {hotels.length > 0 ? (
            <ul>
              {hotels.map((hotel) => (
                <li key={hotel.hotel_id}>
                  <h3>{hotel.name}</h3>
                  <p>Address: {hotel.address}</p>
                  <p>Phone: {hotel.phone}</p>
                  <p>Email: {hotel.email}</p>
                  <p>Overview: {hotel.overview}</p>
                  <p>Price per night: {hotel.price_per_night}</p>
                  <p>Available people count: {hotel.available_people_count}</p>
                  <p>Available night count: {hotel.available_night_count}</p>
                  <p>Room type: {hotel.room_type}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hotels found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;