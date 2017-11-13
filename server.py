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
	disconnect_db()

@app.before_request
def connect_db():
	DBSingelton.getInstance().connect()

@app.teardown_request
def disconnect_db(err=None):
	DBSingelton.getInstance().close()


app.secret_key = os.environ.get("FLASK_SECRET_KEY")

@app.route('/users', methods=['GET'])
def get_users():
	query = Users.select()
	
	if query.count()<1:
		return "Nothing to return"
	
	return jsonify({'users':query.get()._data})

@app.route('/users/<int:number>', methods=['GET'])
def get_one_user(number):
	query = Users.select().where(Users.id == number)
	
	if query.count()<1:
		return "Nothing to return"
	
	return jsonify({'users':query.get()._data})
		
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

# cURL
# Postman


# curl -X POST http://localhost:5000/users -d 'fname=Francis&lname=Addai&email=franci.@mest.com&phone=9320239023Y&event=Hello'