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
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [hotelData, setHotelData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    overview: '',
    latitude: '',
    longitude: '',
    description: '',
    amenities: '',
    policies: '',
    available_night_count: '',
    available_people_count: '',
    price_per_night: '',
    room_type: ''
  });
  const [updateData, setUpdateData] = useState({
    hotel_name: '',
    new_room_count: '',
    new_people_count: ''
  });
  const [deleteHotelName, setDeleteHotelName] = useState('');

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
          min_people: minPeople,
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

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', loginData);
      setToken(response.data.access_token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  const handleInsertHotel = async () => {
    try {
      const response = await axios.post('/api/hotels/insert_hotel', hotelData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error inserting hotel', error);
    }
  };

  const handleUpdateHotel = async () => {
    try {
      const response = await axios.put('/api/hotels/update_hotel', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error updating hotel', error);
    }
  };

  const handleDeleteHotel = async () => {
    try {
      const response = await axios.delete('/api/hotels/delete_hotel', {
        params: { hotel_name: deleteHotelName },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error deleting hotel', error);
    }
  };

  return (
    <div className="App">
      <h1>Hotel Search</h1>

      {!isLoggedIn ? (
        <div className="login-section">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <div className="insert-section">
            <h2>Insert Hotel</h2>
            <input
              type="text"
              placeholder="Name"
              value={hotelData.name}
              onChange={(e) => setHotelData({ ...hotelData, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address"
              value={hotelData.address}
              onChange={(e) => setHotelData({ ...hotelData, address: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              value={hotelData.phone}
              onChange={(e) => setHotelData({ ...hotelData, phone: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={hotelData.email}
              onChange={(e) => setHotelData({ ...hotelData, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Overview"
              value={hotelData.overview}
              onChange={(e) => setHotelData({ ...hotelData, overview: e.target.value })}
            />
            <input
              type="number"
              placeholder="Latitude"
              value={hotelData.latitude}
              onChange={(e) => setHotelData({ ...hotelData, latitude: e.target.value })}
            />
            <input
              type="number"
              placeholder="Longitude"
              value={hotelData.longitude}
              onChange={(e) => setHotelData({ ...hotelData, longitude: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              value={hotelData.description}
              onChange={(e) => setHotelData({ ...hotelData, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="Amenities"
              value={hotelData.amenities}
              onChange={(e) => setHotelData({ ...hotelData, amenities: e.target.value })}
            />
            <input
              type="text"
              placeholder="Policies"
              value={hotelData.policies}
              onChange={(e) => setHotelData({ ...hotelData, policies: e.target.value })}
            />
            <input
              type="number"
              placeholder="Available Night Count"
              value={hotelData.available_night_count}
              onChange={(e) => setHotelData({ ...hotelData, available_night_count: e.target.value })}
            />
            <input
              type="number"
              placeholder="Available People Count"
              value={hotelData.available_people_count}
              onChange={(e) => setHotelData({ ...hotelData, available_people_count: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price per Night"
              value={hotelData.price_per_night}
              onChange={(e) => setHotelData({ ...hotelData, price_per_night: e.target.value })}
            />
            <input
              type="text"
              placeholder="Room Type"
              value={hotelData.room_type}
              onChange={(e) => setHotelData({ ...hotelData, room_type: e.target.value })}
            />
            <button onClick={handleInsertHotel}>Insert Hotel</button>
          </div>

          <div className="update-section">
            <h2>Update Hotel</h2>
            <input
              type="text"
              placeholder="Hotel Name"
              value={updateData.hotel_name}
              onChange={(e) => setUpdateData({ ...updateData, hotel_name: e.target.value })}
            />
            <input
              type="number"
              placeholder="New Room Count"
              value={updateData.new_room_count}
              onChange={(e) => setUpdateData({ ...updateData, new_room_count: e.target.value })}
            />
            <input
              type="number"
              placeholder="New People Count"
              value={updateData.new_people_count}
              onChange={(e) => setUpdateData({ ...updateData, new_people_count: e.target.value })}
            />
            <button onClick={handleUpdateHotel}>Update Hotel</button>
          </div>

          <div className="delete-section">
            <h2>Delete Hotel</h2>
            <input
              type="text"
              placeholder="Hotel Name"
              value={deleteHotelName}
              onChange={(e) => setDeleteHotelName(e.target.value)}
            />
            <button onClick={handleDeleteHotel}>Delete Hotel</button>
          </div>
        </>
      )}

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
