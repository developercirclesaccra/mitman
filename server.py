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