import sys, os
sys.path.append(os.getcwd())

from flask import Flask, render_template, redirect, session, request
from models.app_models import Users
from models.base_model import DBSingelton

# create an instance of flask
app = Flask(__name__)

# before any request
@app.before_first_request
def initialize_tables():
	connect_db()
	if not FactModel.table_exists():
		FactModel.create_table()
	disconnect_db()

# before each request
@app.before_request
def connect_db():
	DBSingelton.getInstance().connect()

# after request
@app.teardown_request
def disconnect_db(err=None):
	DBSingelton.getInstance().close()


# add user
@app.route('/', methods=["POST"])
def index():
	data = {}
	if request.method in ("POST", "PUT"):
		data = request.form
		first_name = data["first_name"]
		last_name = data["last_name"]
		email = data["email"]
		phone_number = data["phone_number"]
		event = data["event"]
	query=Users.insert(first_name=first_name,last_name=last_name,email=email, phone_number=phone_number, event=event).execute()
		return "successfully added"

	return jsonify({"request_type": request.method, "data":data})

# get all users from database
@app.route('/users/get_users', methods=['GET'])
def get_users():
	query = Users.select()

	if query.count()<1:
		return "No one wants to show up"

	return jsonify({'users':query.get()._data})

	

app.secret_key = os.environ.get("FLASK_SECRET_KEY")
