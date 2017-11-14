from models.base import *
from peewee import CharField, BooleanField, TextField, DateTimeField
from datetime import datetime

class Users(BaseModel):
	first_name = CharField(40)
	last_name = CharField(40)
	email = CharField(40)
	phone_number = CharField(40)
	event = CharField(40)

class Events(BaseModel):
	name = CharField(40)
	description = CharField(100)
	venue = CharField(40)
	date_time = DateTimeField
	poster_image_link = CharField(100)
	is_swag = BooleanField
	hashtag = CharField(40)
	organizer = CharField(40)
	feedback_time = DateTimeField
	start_time = DateTimeField
	end_time = DateTimeField
	topic = CharField(40)
	speaker = CharField(40)