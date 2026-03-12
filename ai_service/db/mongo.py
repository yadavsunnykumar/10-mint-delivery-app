from pymongo import MongoClient
import certifi
import dotenv
import os

# Load environment variables from a .env file
dotenv.load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

_client = None
_db = None
products_collection = None

def get_connection():
    global _client, _db, products_collection
    if _client is None:
        _client = MongoClient(
            MONGO_URL,
            tls=True, 
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        _db = _client["zepto"]
        products_collection = _db["products"]
    return products_collection

# Lazy initialize on first import if needed
def init_connection():
    get_connection()
