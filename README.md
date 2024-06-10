# University Tuition Management API
This is a hotel booking system built with React for the frontend and Flask for the backend. It allows users to search for hotels, view details, check availability, and book rooms.


# Design
## Assumptions
The system consists of the following main components:

#### Frontend: Built with React, it provides a user-friendly interface for searching hotels and booking rooms.
  - User Authentication: Users can log in to access the system.
  - Admin Panel: Admins can log in to manage hotels (insert, update, delete).
  - Hotel Search: Users can search for hotels based on available nights, available people count, price range, and a combination of these criteria.
  - Map Integration: Users can see the location of a selected hotel on a map.
  - Hotel Details: Users can view detailed information about each hotel, including address, phone, email, overview, description, amenities, and policies.
  - Booking: Users can book a hotel by specifying the number of nights and people.

#### Backend: Implemented using Flask, it handles requests from the frontend, interacts with the database, and manages user authentication.


Authentication:
  - POST /api/admin/login: Allows an admin user to log in and receive a JWT token for authentication.


User Login:
  - POST /api/user/login: Allows a regular user to log in using username and password.


Hotels:
  - GET /api/hotels: Retrieves a list of all hotels with basic information.
  - GET /api/hotels/price_range: Retrieves hotels within a specified price range.
  - GET /api/hotels/available_nights: Retrieves hotels with a minimum number of available nights.
  - GET /api/hotels/available_people_count: Retrieves hotels with a minimum number of available people count.
  - GET /api/hotels/search: Searches hotels based on various criteria (price range, available nights, available people count).
  - GET /api/hotels/details: Retrieves detailed information about a specific hotel.
  - GET /api/hotels/coordinates: Retrieves the coordinates (latitude and longitude) of a specific hotel.
  - POST /api/hotels/insert_hotel: Inserts a new hotel into the database (admin access required).
  - DELETE /api/hotels/delete_hotel: Deletes a hotel from the database by name (admin access required).
  - PUT /api/hotels/update_hotel: Updates the available room and people count for a hotel (admin access required).


Booking:
  - PUT /api/hotels/book_hotel: Books a hotel for a specified number of nights and people count.


#### Database: Uses a PostgreSQL database to store information about hotels, room availability, user details, and more.
  - Implemented using ElephantSQL database provider.
  - Each hotel has a name, address, phone number, email, and an overview.
  - Users can search for hotels by location, date, and number of guests.
  - Hotel details include descriptions, amenities, and policies.
  - Each hotel has geographical coordinates (latitude and longitude) to display its location on a map.
  - Room availability is based on the number of nights and the number of people.
  - Users can register, login, and manage their bookings.

## Issues Encountered
  - Error Handling: Implementing robust error handling for various scenarios, such as invalid inputs or database errors, required careful consideration to provide meaningful error messages to clients.
  - Testing: Thorough testing was necessary to ensure that the API functions correctly under various scenarios, including edge cases and concurrent requests.
  - Database Schema Design: Designing an effective database schema that meets the requirements of the API while ensuring data integrity and performance was a challenging task.
  - Deployment: Azure sometimes outright deletes my doployment compleatly without any notice probably because I am using a free deployment  method
  - Google Maps API Key: Ensure that the Google Maps API key used in the application is valid and has the necessary permissions. Otherwise, the map integration may not work correctly.
  - Map Integration: Ensure that the map integration is functioning correctly and that the map centers on the selected hotel's location when the "Show Location" button is clicked.
  - Hotel Details Display: Verify that the hotel details are being fetched and displayed correctly when a user clicks on "Show Details" for a specific hote
  - Booking Process: Check the booking process to ensure that users can successfully book a hotel by specifying the number of nights and people.
  - Error Handling: Implement proper error handling throughout the application to provide meaningful error messages to users when something goes wrong.


## Data Model
The data model for the project is as follows:

<a href="https://imgbb.com/"><img src="https://i.ibb.co/BscGTJT/Screenshot-2024-06-10-101928.png" alt="Screenshot-2024-06-10-101928" border="0"></a>

### Tables:
#### User

  - user_id (Primary Key)
  - username
  - password_hash
  - is_admin

#### Hotel

  - hotel_id (Primary Key)
  - name
  - address
  - phone
  - email
  - overview
  - latitude
  - longitude
  - description
  - amenities
  - policies

#### HotelAvailability

  - availability_id (Primary Key)
  - hotel_id (Foreign Key to Hotel)
  - available_night_count
  - available_people_count
  - price_per_night
  - room_type

#### Booking

  - booking_id (Primary Key)
  - user_id (Foreign Key to User)
  - hotel_id (Foreign Key to Hotel)
  - night_count
  - people_count
  - booking_date

####  Relationships:
  - Users must have username, email and password
  - Users can Book hotels
  - One Hotel can have multiple HotelAvailabilities.
  - One Hotel can have multiple Bookings.
  - Hotels must have details.
  - Hotels must have coordinates.

## Deployment Links
  - Frontend: https://66669fdbe3de4203e24b2e30--sparkly-meerkat-1f9169.netlify.app/
  - Backend: https://hotelapitesting.azurewebsites.net/
  - Docker Image: https://hub.docker.com/repository/docker/berkpksn/hotelapi/general

## Video
Youtube:

<a href="https://www.youtube.com/watch?v=XSZqFXJF_is"><img src="https://img.youtube.com/vi/XSZqFXJF_is/0.jpg" alt="vid" border="0" width="355" height="200" /></a>



Drive:


<a href="https://drive.google.com/file/d/1dWfMti-bT6yNL8_UeCB904-tMvzjTJLy/view?usp=sharing"><img src="https://i.ibb.co/82jQpBK/vid.png" alt="vid" border="0" width="355" height="200" /></a>


