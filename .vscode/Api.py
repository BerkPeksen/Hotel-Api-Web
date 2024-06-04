import os
import psycopg2
from dotenv import load_dotenv
from flask import Flask, jsonify, request, render_template

load_dotenv()

app = Flask(__name__)
url = os.getenv("DATABASE_URL")
connection = psycopg2.connect(url)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    data = {
        'message': 'Hello, World!',
        'items': [1, 2, 3, 4, 5]
    }
    return jsonify(data)

@app.route('/api/data', methods=['POST'])
def add_data():
    new_item = request.json.get('item')
    # Process the new item here (e.g., save to a database)
    return jsonify({'message': 'Item added', 'item': new_item}), 201


@app.route('/api/hotels', methods=['GET'])
def get_hotels():
    with connection.cursor() as cursor:
        cursor.execute('SELECT * FROM Hotels;')
        hotels = cursor.fetchall()

    hotels_list = []
    for hotel in hotels:
        hotel_dict = {
            'hotel_id': hotel[0],
            'name': hotel[1],
            'address': hotel[2],
            'phone': hotel[3],
            'email': hotel[4],
            'overview': hotel[5]
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

@app.route('/api/hotels/details', methods=['GET'])
def get_hotel_details_by_name():
    hotel_name = request.args.get('hotel_name')

    if hotel_name is None:
        return jsonify({'error': 'Please provide hotel_name query parameter'}), 400

    with connection.cursor() as cursor:
        query = """
        SELECT h.name, h.address, hc.latitude, hc.longitude, hd.description, hd.amenities, hd.policies
        FROM Hotels h
        JOIN HotelCoordinates hc ON h.hotel_id = hc.hotel_id
        JOIN HotelDetails hd ON h.hotel_id = hd.hotel_id
        WHERE h.name = %s
        """
        cursor.execute(query, (hotel_name,))
        result = cursor.fetchone()

    if result is None:
        return jsonify({'error': 'Hotel not found'}), 404

    hotel_details = {
        'name': result[0],
        'address': result[1],
        'latitude': float(result[2]),  # Convert to float
        'longitude': float(result[3]),  # Convert to float
        'description': result[4],
        'amenities': result[5],
        'policies': result[6]
    }

    return jsonify(hotel_details)

@app.route('/api/hotels/insert_hotel', methods=['POST'])
def add_hotel():
    data = request.json

    if not all(key in data for key in ['name', 'address', 'phone', 'email', 'overview', 'latitude', 'longitude', 'description', 'amenities', 'policies']):
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

    connection.commit()

    return jsonify({'message': 'Hotel added successfully'}), 201

@app.route('/api/hotels/delete_hotel', methods=['DELETE'])
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

if __name__ == '__main__':
    app.run(debug=True)