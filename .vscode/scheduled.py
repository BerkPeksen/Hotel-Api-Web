import psycopg2
import smtplib
import pika
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Database connection details
DATABASE_URL = "postgres://lekjueer:SKjAbK_bGwYJXMqT1U4fbiIbZ3_q0gEh@flora.db.elephantsql.com/lekjueer"

# Establish connection to RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Declare the queue
channel.queue_declare(queue='hotel_bookings')
def callback(ch, method, properties, body):
    message = json.loads(body.decode('utf-8'))
    print("Received message:", message)


try:
    # Connect to the database
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Retrieve data
    cursor.execute("SELECT * FROM RoomAvailability WHERE available_people_count <= available_night_count * 3")
    rows = cursor.fetchall()

    
    channel.basic_consume(queue='hotel_bookings', on_message_callback=callback, auto_ack=True)

    # Send email if there are rows that meet the condition
    if rows:
        # Email configuration
        sender_email = "peksendontreply@hotmail.com"
        receiver_email = "20070001023@stu.yasar.edu.tr"
        password = "568363Dont"

        message = MIMEMultipart("alternative")
        message["Subject"] = "Room Availability Alert"
        message["From"] = sender_email
        message["To"] = receiver_email

        text = "Room availability alert: \n"
        for row in rows:
            text += f"Hotel ID: {row[1]}, Available People Count: {row[3]}, Available Night Count: {row[2]}\n"

        part1 = MIMEText(text, "plain")
        message.attach(part1)

        # Send email
        with smtplib.SMTP('smtp-mail.outlook.com', 587) as server:
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message.as_string())
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    # Close database connection
    cursor.close()
    conn.close()