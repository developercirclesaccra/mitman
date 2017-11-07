from models.base_model import *
from peewee import CharField, BooleanField, TextField, DateTimeField

from datetime import datetime

class Users(BaseModel):
    first_name = CharField(40)
    last_name = CharField(40)
    email = CharField(100)
    phone_number = CharField(20)
    event = CharField(20)
