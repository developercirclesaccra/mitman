from models.base import *
from peewee import CharField, BooleanField, TextField, DateTimeField
from datetime import datetime

class Users(BaseModel):
	first_name = CharField(40)
	last_name = CharField(40)
	email = CharField(40)
	phonenumber = CharField(40)
	event = CharField(40)
