from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId

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
#

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
            "donation_reminders": data.get("donation_reminders", False),
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
        db = client['closetlab']  # Replace 'closetlab' with your actual database name
        clothing_items_collection = db['clothing_items']
        
        # Retrieve all items from the collection
        clothes = list(clothing_items_collection.find())

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



if __name__ == '__main__':
    app.run(host='0.0.0.0',port='8000') 