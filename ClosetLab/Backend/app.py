from bson import ObjectId
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)
CORS(app)  # Allow all origins for testing

# database integration
uri = "mongodb+srv://kmalsky:Cw1ccE8Bq5VV8Lwe@closetlab.q7yvq.mongodb.net/?retryWrites=true&w=majority&appName=ClosetLab"

client = MongoClient(uri, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print("MongoDB Connection Failed")
    print(e)

print(client.list_database_names())
closet_lab_database = client["closet_lab_db"]
print("For reference, the names of the collections in the database are: " + str(closet_lab_database.list_collection_names()))

# Use this for testing since users/auth aren't implemented yet.
dummy_user_id = "67057228f80354e361ae2bf5"

def db_get_clothing_item(object_id: str):
    try: 
        print("Getting clothing item from database")
        clothing_item_collection = closet_lab_database["clothing_items"]
        document = clothing_item_collection.find_one({"_id": ObjectId(object_id)})
        return document
    except Exception as e:
        print("Error getting clothing item from database, " + e)

def db_add_clothing_item(image_link: str, name:str = "", user_id: str = dummy_user_id, brand_tags: list[str] = [], color_tags: list[str] = [], other_tags: list[str] = [], type_tags: list[str] = []):
    try:
        print("Adding clothing item to database")
        clothing_item_collection = closet_lab_database["clothing_items"]
        clothing_item_collection.insert_one({"image_link": image_link, "name": name, user_id: ObjectId(user_id), "brand_tags": brand_tags, "color_tags": color_tags, "other_tags": other_tags, "type_tags": other_tags})
    except Exception as e:
        print("Error adding item to database, " + e)

def db_delete_clothing_item(object_id: str):
    try:
        print("Deleting clothing item from database")
        clothing_item_collection = closet_lab_database["clothing_items"]
        clothing_item_collection.delete_one({"_id": ObjectId(object_id)})
    except Exception as e:
        print("Error removing item from database, " + e)

def db_get_outfit(object_id: str):
    try:
        print("Getting outfit from database")
        outfit_collection = closet_lab_database["outfits"]
        document = outfit_collection.find_one({"_id": ObjectId(object_id)})
        return document
    except Exception as e:
        print("Error getting outfit from database, " + e)

def db_add_outfit(user_id: str = dummy_user_id, name:str = "Unnamed Outfit", items: list[str] = []):
    try:
        print("Adding outfit to database")
        outfit_collection = closet_lab_database["outfits"]
        item_ids = []
        for item in items:
            item_ids.append(ObjectId(item))
        outfit_collection.insert_one({"user_id": ObjectId(user_id), "name": name, items: item_ids})
    except Exception as e:
        print("Error adding outfit to database, " + e)

def db_delete_outfit(object_id: str):
    try:
        print("Deleting outfit from database")
        outfit_collection = closet_lab_database["outfits"]
        outfit_collection.delete_one({"_id": ObjectId(object_id)})
    except Exception as e:
        print("Error deleting object from database, " + e)

db_add_clothing_item("example.com/testdb", "Test from backend")
# end database functions

@app.route('/api/v1/post-clothes', methods=['POST', 'OPTIONS'])
def post_clothes():
    if request.method == 'OPTIONS':
    # Handle CORS preflight request
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response


if __name__ == '__main__':
    app.run(host='0.0.0.0',port='8000') 