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
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [adminLoginData, setAdminLoginData] = useState({ username: '', password: '' });
  const [userLoginData, setUserLoginData] = useState({ username: '', password: '' });
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

  const handleAdminLogin = async () => {
    try {
      const response = await axios.post('/api/admin/login', adminLoginData);
      setToken(response.data.access_token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  const handleUserLogin = async () => {
    try {
      const response = await axios.post('/api/user/login', userLoginData);
      if (response.data.message === 'Login successful') {
        setIsUserLoggedIn(true);
      }
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

  const applyDiscount = (price) => {
    return price - price * 0.1;
  };

  return (
    <div className="App">
      <h1>Hotel Search</h1>

      {!isUserLoggedIn ? (
        <div className="user-login-section">
          <h2>User Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={userLoginData.username}
            onChange={(e) => setUserLoginData({ ...userLoginData, username: e.target.value })}
          />
          <input
            type="text"
            placeholder="Password"
            value={userLoginData.password}
            onChange={(e) => setUserLoginData({ ...userLoginData, password: e.target.value })}
          />
          <button onClick={handleUserLogin}>User Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, User</h2>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="admin-login-section">
          <h2>Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={adminLoginData.username}
            onChange={(e) => setAdminLoginData({ ...adminLoginData, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={adminLoginData.password}
            onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
          />
          <button onClick={handleAdminLogin}>Admin Login</button>
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
        <div className="search-by-nights">
          <h2>Search Hotels by Available Nights</h2>
          <input
            type="number"
            placeholder="Min Nights"
            value={minNights}
            onChange={(e) => setMinNights(e.target.value)}
          />
          <button onClick={() => handleButtonClick(fetchHotelsByAvailableNights)}>
            {searchType === 'available_nights' ? 'Clear Results' : 'Search'}
          </button>
        </div>

        <div className="search-by-people">
          <h2>Search Hotels by Available People Count</h2>
          <input
            type="number"
            placeholder="Min People"
            value={minPeople}
            onChange={(e) => setMinPeople(e.target.value)}
          />
          <button onClick={() => handleButtonClick(fetchHotelsByAvailablePeopleCount)}>
            {searchType === 'available_people_count' ? 'Clear Results' : 'Search'}
          </button>
        </div>

        <div className="search-by-price">
          <h2>Search Hotels by Price Range</h2>
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
            {searchType === 'price_range' ? 'Clear Results' : 'Search'}
          </button>
        </div>

        <div className="combined-search">
          <h2>Combined Search</h2>
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
            {searchType === 'combined_search' ? 'Clear Results' : 'Search'}
          </button>
        </div>
      </div>

      <div className="hotel-results">
        <h2>Hotel Results</h2>
        {hotels.map((hotel, index) => (
          <div key={index} className="hotel">
            <h3>{hotel.name}</h3>
            <p>{hotel.address}</p>
            <p>{hotel.phone}</p>
            <p>{hotel.email}</p>
            <p>{hotel.overview}</p>
            <p>{hotel.description}</p>
            <p>{hotel.amenities}</p>
            <p>{hotel.policies}</p>
            <p>Latitude: {hotel.latitude}</p>
            <p>Longitude: {hotel.longitude}</p>
            <p>Available Night Count: {hotel.available_night_count}</p>
            <p>Available People Count: {hotel.available_people_count}</p>
            <p>
              Price per Night: ${isUserLoggedIn ? applyDiscount(hotel.price_per_night) : hotel.price_per_night}
            </p>
            <p>Room Type: {hotel.room_type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
