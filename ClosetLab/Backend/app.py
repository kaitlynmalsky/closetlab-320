from bson import ObjectId
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import base64

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
        with open(image_link, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
            clothing_item_collection.insert_one({"image_link": image_link, "image": encoded_string, "name": name, user_id: ObjectId(user_id), "brand_tags": brand_tags, "color_tags": color_tags, "other_tags": other_tags, "type_tags": other_tags})
    except Exception as e:
        print("Error adding item to database, " + e)

def db_delete_clothing_item(object_id: str):
    try:
        print("Deleting clothing item from database")
        clothing_item_collection = closet_lab_database["clothing_items"]
        print(clothing_item_collection.delete_one({"_id": ObjectId(object_id)}))
    except Exception as e:
        print("Error removing item from database, " + e)

def db_ClearAll_clothing_item(): #for debugging; do not ever use this normally
    try:
        print("Deleting all clothing items from database")
        clothing_item_collection = closet_lab_database["clothing_items"]
        for item in clothing_item_collection.find():
            print(clothing_item_collection.delete_one({"_id": item["_id"]}))
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

def db_add_outfit(user_id: str = dummy_user_id, name:str = "", items: list[str] = []):
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

db_add_clothing_item(image_link="./assets/favicon.png")
db_delete_clothing_item("671d247379293f2823fdbca6")
db_ClearAll_clothing_item()
# end database functions

@app.route('/api/v1/post-clothes', methods=['POST'])
def post_clothes():
    try:
        db = client['closetlab']
        clothing_items_collection = db['clothing_items']

        # Retrieve data from request
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Prepare the clothing item for insertion
        clothing_item = {
            "name": data.get("name"),
            "image_link": data.get("image_link"),
            "color_tags": data.get("color_tags", []),
            "type_tags": data.get("type_tags", []),
            "brand_tags": data.get("brand_tags", []),
            "other_tags": data.get("other_tags", []),
            "donation_reminders": data.get("useDonationReminder", False),
            "user_id": ObjectId(data.get("user_id"))  # Convert user_id to ObjectId
        }

        # Insert clothing item into the database
        result = clothing_items_collection.insert_one(clothing_item)

        # Return success message
        return jsonify({'message': 'Clothing item added', 'id': str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/v1/get-clothes', methods=['GET'])
def get_clothes():
    try:
        # Access the "clothing_items" collection
        db = client['closetlab']
        clothing_items_collection = db['clothing_items']
        
        # Retrieve all items from the collection
        clothes = list(clothing_items_collection.find())
        print(clothes)
        # Convert MongoDB ObjectId to string for JSON serialization
        for item in clothes:
            item['_id'] = str(item['_id'])
            if 'user_id' in item:
                item['user_id'] = str(item['user_id'])
            # If tags are ObjectIDs, convert them to strings as well
            item['color_tags'] = [str(tag) for tag in item.get('color_tags', [])]
            item['type_tags']  = [str(tag) for tag in item.get('type_tags',  [])]
            item['brand_tags'] = [str(tag) for tag in item.get('brand_tags', [])]
            item['other_tags'] = [str(tag) for tag in item.get('other_tags', [])]

        # Return the clothes as JSON
        return jsonify(clothes), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/v1/get-clothes/<string:clothing_id>', methods=['GET'])
def get_clothing_by_id(clothing_id):
    try:
        # Access the "clothing_items" collection
        db = client['closetlab']  # Replace 'closetlab' with your actual database name
        clothing_items_collection = db['clothing_items']

        # Convert the clothing_id to ObjectId and find the item
        clothing_item = clothing_items_collection.find_one({'_id': ObjectId(clothing_id)})

        if clothing_item:
            # Convert ObjectId to string for JSON serialization
            clothing_item['_id'] = str(clothing_item['_id'])
            if 'user_id' in clothing_item:
                clothing_item['user_id'] = str(clothing_item['user_id'])
            clothing_item['color_tags'] = [str(tag) for tag in clothing_item.get('color_tags', [])]
            clothing_item['type_tags'] = [str(tag) for tag in clothing_item.get('type_tags', [])]
            clothing_item['brand_tags'] = [str(tag) for tag in clothing_item.get('brand_tags', [])]
            clothing_item['other_tags'] = [str(tag) for tag in clothing_item.get('other_tags', [])]

            return jsonify(clothing_item), 200
        else:
            return jsonify({'error': 'Clothing item not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/scrap', methods=['GET'])
def scrap(): #so that this database doesn't get impossibly messy while I'm testing
    try:
        db = client['closetlab']
        clothing_item_collection = db['clothing_items']
        try:
            print("Deleting all clothing items from database")
            for item in clothing_item_collection.find():
                print(clothing_item_collection.delete_one({"_id": item["_id"]}))
        except Exception as e:
            print("Error removing item from database, " + e)

        # Return success message
        return jsonify({'message': 'Destroyed database data'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0',port='8000') 
