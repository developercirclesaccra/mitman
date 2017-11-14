import sys, os
sys.path.append(os.getcwd())

from flask import Flask, render_template, redirect, session, request, jsonify
from models.mitman_models import *
from models.base import DBSingelton

app = Flask(__name__)

@app.before_first_request
def initialize_tables():
	connect_db()
	if not Users.table_exists():
		Users.create_table()
	if not Events.table_exists():
		Events.create_table()
	disconnect_db()

@app.before_request
def connect_db():
	DBSingelton.getInstance().connect()

@app.teardown_request
def disconnect_db(err=None):
	DBSingelton.getInstance().close()


app.secret_key = os.environ.get("FLASK_SECRET_KEY")

# getting all users
@app.route('/users', methods=['GET'])
def get_users():
	query = Users.select()
	
	if query.count()<1:
		return "Nothing to return"
	
	return jsonify({'users':query.get()._data})

# getting one user with a specific id
@app.route('/users/<int:number>', methods=['GET'])
def get_one_user(number):
	query = Users.select().where(Users.id == number)
	
	if query.count()<1:
		return "Nothing to return"
	
	return jsonify({'users':query.get()._data})
	
# adding a user	
@app.route('/users', methods=['POST'])
def add_users():
	first_name = request.form.get('fname')
	last_name = request.form.get('lname')
	email = request.form.get('email')
	phone_number = request.form.get('phone')
	event = request.form.get('event')

	query = Users.insert(first_name=first_name,last_name=last_name,email=email,phone_number=phone_number,event=event)
	query.execute()
	return "Query recorded"

# add an event
@app.route('/Events', methods=['POST'])
def add_events():
	name = request.form.get('name')
	description = request.form.get('description')
	venue = request.form.get('venue')
	date_time = request.form.get('date_time')
	poster_image_link = request.form.get('poster_image_link')
	is_swag = request.form.get('is_swag')
	hashtag = request.form.get('hashtag')
	organizer = request.form.get('organizer')
	feedback_time = request.form.get('feedback_time')
	start_time = request.form.get('start_time')
	end_time = request.form.get('end_time')
	topic = request.form.get('topic')
	speaker = request.form.get('speakers')

	query = Users.insert(name=name,description=description,venue=venue,date_time=date_time,poster_image_link=poster_image_link,is_swag=is_swag,hashtag=hashtag,organizer=organizer,feedback_time=feedback_time,start_time=start_time,end_time=end_time,topic=topic,speaker=speaker)
	query.execute()
	return "Query recorded"

# get all Events
@app.route('/Events', methods=['GET'])
def get_events():
	query = Events.select()
	
	if query.count()<1:
		return "Nothing to return"
	
	return jsonify({'events':query.get()._data})

