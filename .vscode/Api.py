import os
import psycopg2
from dotenv import load_dotenv
from flask import Flask, jsonify, request, render_template
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pika
import json

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
rabbitconnection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
rabbitchannel = rabbitconnection.channel()
rabbitchannel.queue_declare(queue='hotel_bookings')

jwt = JWTManager(app)
url = os.getenv("DATABASE_URL")
connection = psycopg2.connect(url)


@app.route('/api/admin/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    # Validate username and password (this is a simple example, adapt it to your needs)
    if username == 'admin' and password == 'password':  # Change this to use your user validation logic
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401
    
@app.route('/api/user/login', methods=['POST'])
def user_login():
    data = request.json

    if not all(key in data for key in ['username', 'password']):
        return jsonify({'error': 'Missing username or password'}), 400

    username = data['username']
    password = data['password']

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
        user = cursor.fetchone()

        if user is None:
            return jsonify({'error': 'Invalid username or password'}), 401

    return jsonify({'message': 'Login successful'}), 200
    

@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    with connection.cursor() as cursor:
        query = """
        SELECT h.hotel_id, h.name, h.address, h.phone, h.email, h.overview,
               ra.price_per_night, ra.available_people_count, ra.available_night_count, ra.room_type
        FROM Hotels h
        JOIN RoomAvailability ra ON h.hotel_id = ra.hotel_id;
        """
        cursor.execute(query)
        hotels = cursor.fetchall()

    hotels_list = []
    for hotel in hotels:
        hotel_dict = {
            'hotel_id': hotel[0],
            'name': hotel[1],
            'address': hotel[2],
            'phone': hotel[3],
            'email': hotel[4],
            'overview': hotel[5],
            'price_per_night': hotel[6],
            'available_people_count': hotel[7],
            'available_night_count': hotel[8],
            'room_type': hotel[9]
        }
        hotels_list.append(hotel_dict)

    return jsonify(hotels_list)


@app.route('/api/hotels/price_range', methods=['GET'])
def get_hotels_by_price_range():
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    if min_price is None or max_price is None:
        return jsonify({'error': 'Please provide min_price and max_price query parameters'}), 400

    with connection.cursor() as cursor:
        query = """
        SELECT DISTINCT h.hotel_id, h.name, h.address, h.phone, h.email, h.overview,
               ra.price_per_night, ra.room_type, ra.available_night_count, ra.available_people_count
        FROM Hotels h
        JOIN RoomAvailability ra ON h.hotel_id = ra.hotel_id
        WHERE ra.price_per_night BETWEEN %s AND %s
        """
        cursor.execute(query, (min_price, max_price))
        results = cursor.fetchall()

    hotels_list = []
    for result in results:
        hotel_dict = {
            'hotel_id': result[0],
            'name': result[1],
            'address': result[2],
            'phone': result[3],
            'email': result[4],
            'overview': result[5],
            'price_per_night': result[6],
            'room_type': result[7],
            'available_night_count': result[8],
            'available_people_count': result[9]
        }
        hotels_list.append(hotel_dict)

    return jsonify(hotels_list)


@app.route('/api/hotels/available_nights', methods=['GET'])
def get_hotels_by_available_nights():
    min_nights = request.args.get('min_nights', type=int)

    if min_nights is None:
        return jsonify({'error': 'Please provide min_nights query parameter'}), 400

    with connection.cursor() as cursor:
        query = """
        SELECT h.hotel_id, h.name, h.address, h.phone, h.email, h.overview,
               ra.price_per_night, ra.room_type, ra.available_night_count, ra.available_people_count
        FROM Hotels h
        JOIN RoomAvailability ra ON h.hotel_id = ra.hotel_id
        WHERE ra.available_night_count >= %s
        """
        cursor.execute(query, (min_nights,))
        results = cursor.fetchall()

    hotels_list = []
    for result in results:
        hotel_dict = {
            'hotel_id': result[0],
            'name': result[1],
            'address': result[2],
            'phone': result[3],
            'email': result[4],
            'overview': result[5],
            'price_per_night': result[6],
            'room_type': result[7],
            'available_night_count': result[8],
            'available_people_count': result[9]
        }
        hotels_list.append(hotel_dict)

    return jsonify(hotels_list)

@app.route('/api/hotels/available_people_count', methods=['GET'])
def get_hotels_by_available_people_count():
    min_people_count = request.args.get('min_people_count', type=int)

    if min_people_count is None:
        return jsonify({'error': 'Please provide min_people_count query parameter'}), 400

    with connection.cursor() as cursor:
        query = """
        SELECT DISTINCT h.hotel_id, h.name, h.address, h.phone, h.email, h.overview,
               ra.price_per_night, ra.room_type, ra.available_night_count, ra.available_people_count
        FROM Hotels h
        JOIN RoomAvailability ra ON h.hotel_id = ra.hotel_id
        WHERE ra.available_people_count >= %s
        """
        cursor.execute(query, (min_people_count,))
        results = cursor.fetchall()

    hotels_list = []
    for result in results:
        hotel_dict = {
            'hotel_id': result[0],
            'name': result[1],
            'address': result[2],
            'phone': result[3],
            'email': result[4],
            'overview': result[5],
            'price_per_night': result[6],
            'room_type': result[7],
            'available_night_count': result[8],
            'available_people_count': result[9]
        }
        hotels_list.append(hotel_dict)

    return jsonify(hotels_list)


@app.route('/api/hotels/search', methods=['GET'])
def search_hotels():
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_nights = request.args.get('min_nights', type=int)
    min_people = request.args.get('min_people', type=int)

    query_conditions = []
    query_params = []

    if min_price is not None:
        query_conditions.append("ra.price_per_night >= %s")
        query_params.append(min_price)
    if max_price is not None:
        query_conditions.append("ra.price_per_night <= %s")
        query_params.append(max_price)
    if min_nights is not None:
        query_conditions.append("ra.available_night_count >= %s")
        query_params.append(min_nights)
    if min_people is not None:
        query_conditions.append("ra.available_people_count >= %s")
        query_params.append(min_people)

    if not query_conditions:
        return jsonify({'error': 'Please provide at least one query parameter'}), 400

    query = """
    SELECT DISTINCT h.hotel_id, h.name, h.address, h.phone, h.email, h.overview, ra.price_per_night, ra.available_night_count, ra.available_people_count, ra.room_type
    FROM Hotels h
    JOIN RoomAvailability ra ON h.hotel_id = ra.hotel_id
    WHERE {}
    """.format(" AND ".join(query_conditions))

    with connection.cursor() as cursor:
        cursor.execute(query, tuple(query_params))
        results = cursor.fetchall()

    hotels_list = []
    for result in results:
        hotel_dict = {
            'hotel_id': result[0],
            'name': result[1],
            'address': result[2],
            'phone': result[3],
            'email': result[4],
            'overview': result[5],
            'price_per_night': result[6],
            'available_night_count': result[7],
            'available_people_count': result[8],
            'room_type': result[9]
        }
        hotels_list.append(hotel_dict)

    return jsonify(hotels_list)

@app.route('/api/hotels/details', methods=['GET'])
def get_hotel_details_by_name():
    hotel_name = request.args.get('hotel_name')

    if hotel_name is None:
        return jsonify({'error': 'Please provide hotel_name query parameter'}), 400

    with connection.cursor() as cursor:
        query = """
        SELECT h.name, h.address, h.phone, h.email, h.overview, 
               hc.latitude, hc.longitude, 
               hd.description, hd.amenities, hd.policies,
               ha.available_night_count, ha.available_people_count, ha.price_per_night
        FROM Hotels h
        JOIN HotelCoordinates hc ON h.hotel_id = hc.hotel_id
        JOIN HotelDetails hd ON h.hotel_id = hd.hotel_id
        JOIN RoomAvailability ha ON h.hotel_id = ha.hotel_id
        WHERE h.name = %s
        """
        cursor.execute(query, (hotel_name,))
        result = cursor.fetchone()

    if result is None:
        return jsonify({'error': 'Hotel not found'}), 404

    hotel_details = {
        'name': result[0],
        'address': result[1],
        'phone': result[2],
        'email': result[3],
        'overview': result[4],
        'latitude': float(result[5]),  # Convert to float
        'longitude': float(result[6]),  # Convert to float
        'description': result[7],
        'amenities': result[8],
        'policies': result[9],
        'available_night_count': result[10],
        'available_people_count': result[11],
        'price_per_night': result[12]
    }

    return jsonify(hotel_details)

@app.route('/api/hotels/coordinates', methods=['GET'])
def get_hotel_coordinates():
    hotel_name = request.args.get('hotel_name')

    if not hotel_name:
        return jsonify({'error': 'Please provide hotel_name parameter'}), 400

    with connection.cursor() as cursor:
        # Get the coordinates for the given hotel_name
        cursor.execute("SELECT latitude, longitude FROM HotelCoordinates WHERE hotel_id = (SELECT hotel_id FROM Hotels WHERE name = %s)", (hotel_name,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'error': 'Hotel not found'}), 404

        latitude, longitude = result

    return jsonify({'latitude': latitude, 'longitude': longitude}), 200

@app.route('/api/hotels/insert_hotel', methods=['POST'])
@jwt_required()
def add_hotel():
    data = request.json

    required_fields = ['name', 'address', 'phone', 'email', 'overview', 'latitude', 'longitude', 'description', 'amenities', 'policies', 'available_night_count', 'available_people_count', 'price_per_night', 'room_type']
    if not all(key in data for key in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    with connection.cursor() as cursor:
        # Insert into Hotels table
        cursor.execute("""
        INSERT INTO Hotels (name, address, phone, email, overview)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING hotel_id
        """, (data['name'], data['address'], data['phone'], data['email'], data['overview']))
        hotel_id = cursor.fetchone()[0]

        # Insert into HotelCoordinates table
        cursor.execute("""
        INSERT INTO HotelCoordinates (hotel_id, latitude, longitude)
        VALUES (%s, %s, %s)
        """, (hotel_id, data['latitude'], data['longitude']))

        # Insert into HotelDetails table
        cursor.execute("""
        INSERT INTO HotelDetails (hotel_id, description, amenities, policies)
        VALUES (%s, %s, %s, %s)
        """, (hotel_id, data['description'], data['amenities'], data['policies']))

        # Insert into RoomAvailability table
        cursor.execute("""
        INSERT INTO RoomAvailability (hotel_id, available_night_count, available_people_count, price_per_night, room_type)
        VALUES (%s, %s, %s, %s, %s)
        """, (hotel_id, data['available_night_count'], data['available_people_count'], data['price_per_night'], data['room_type']))

    connection.commit()

    return jsonify({'message': 'Hotel added successfully'}), 201

@app.route('/api/hotels/delete_hotel', methods=['DELETE'])
@jwt_required()
def delete_hotel_by_name():
    hotel_name = request.args.get('hotel_name')

    if hotel_name is None:
        return jsonify({'error': 'Please provide hotel_name query parameter'}), 400

    with connection.cursor() as cursor:
        # Get the hotel_id for the given hotel_name
        cursor.execute("SELECT hotel_id FROM Hotels WHERE name = %s", (hotel_name,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'error': 'Hotel not found'}), 404

        hotel_id = result[0]

        # Delete from HotelDetails table
        cursor.execute("DELETE FROM HotelDetails WHERE hotel_id = %s", (hotel_id,))

        # Delete from HotelCoordinates table
        cursor.execute("DELETE FROM HotelCoordinates WHERE hotel_id = %s", (hotel_id,))

        # Delete from RoomAvailability table
        cursor.execute("DELETE FROM RoomAvailability WHERE hotel_id = %s", (hotel_id,))

        # Delete from Hotels table
        cursor.execute("DELETE FROM Hotels WHERE hotel_id = %s", (hotel_id,))

    connection.commit()

    return jsonify({'message': 'Hotel deleted successfully'}), 200

@app.route('/api/hotels/update_hotel', methods=['PUT'])
@jwt_required()
def upgrade_room():
    hotel_name = request.json.get('hotel_name')
    new_room_count = request.json.get('new_room_count')
    new_people_count = request.json.get('new_people_count')

    if not hotel_name or new_room_count is None or new_people_count is None:
        return jsonify({'error': 'Please provide hotel_name, new_room_count, and new_people_count'}), 400

    with connection.cursor() as cursor:
        # Get the hotel_id for the given hotel_name
        cursor.execute("SELECT hotel_id FROM Hotels WHERE name = %s", (hotel_name,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'error': 'Hotel not found'}), 404

        hotel_id = result[0]

        # Update the RoomAvailability table
        cursor.execute("""
            UPDATE RoomAvailability
            SET available_night_count = %s, available_people_count = %s
            WHERE hotel_id = %s
        """, (new_room_count, new_people_count, hotel_id))

    connection.commit()

    return jsonify({'message': 'Room and people count updated successfully'}), 200

@app.route('/api/hotels/book_hotel', methods=['PUT'])
def book_hotel():
    hotel_name = request.args.get('hotel_name')
    night_count = int(request.args.get('night_count'))
    people_count = int(request.args.get('people_count'))

    if not hotel_name or night_count is None or people_count is None:
        return jsonify({'error': 'Please provide hotel_name, night_count, and people_count'}), 400

    with connection.cursor() as cursor:
        # Get the hotel_id for the given hotel_name
        cursor.execute("SELECT hotel_id FROM Hotels WHERE name = %s", (hotel_name,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'error': 'Hotel not found'}), 404

        hotel_id = result[0]

        # Get available night and people count from RoomAvailability
        cursor.execute("SELECT available_night_count, available_people_count FROM RoomAvailability WHERE hotel_id = %s", (hotel_id,))
        availability_result = cursor.fetchone()

        if availability_result is None:
            return jsonify({'error': 'Availability not found for the hotel'}), 404

        available_night_count, available_people_count = availability_result

        if night_count > available_night_count or people_count > available_people_count:
            return jsonify({'error': 'Not enough available nights or people count'}), 400

        # Update the RoomAvailability table
        cursor.execute("""
            UPDATE RoomAvailability
            SET available_night_count = available_night_count - %s, available_people_count = available_people_count - %s
            WHERE hotel_id = %s
        """, (night_count, people_count, hotel_id))

    connection.commit()
        
    rabbitmessage = {
        'hotel_name': hotel_name,
        'night_count': night_count,
        'people_count': people_count,
        'hotel_id': hotel_id  # You may need to include hotel_id if it's needed for further processing
    }

    rabbitchannel.basic_publish(exchange='', routing_key='hotel_bookings', body=json.dumps(rabbitmessage))

    return jsonify({'message': 'Hotel booked successfully'}), 200



if __name__ == '__main__':
    app.run(debug=True)