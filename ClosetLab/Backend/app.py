from flask import Flask, jsonify, request
from flask_cors import CORS
from bson.objectid import ObjectId
import datetime
import boto3
import base64
import os
from FullOutfitAlgorithm import (
    createCollage
)

from db_helpers import (
    db_add_clothing_item_image,
    db_remove_clothing_item_tag,
    db_set_donation_reminders,
    dummy_user_id,
    client,
    db_get_clothing_item,
    db_add_clothing_item,
    db_delete_clothing_item,
    db_get_outfit,
    db_add_outfit,
    db_delete_outfit,
    db_add_clothing_item_tag,
    db_get_calendar_by_user,
    db_add_day,
    db_get_day
)

app = Flask(__name__)
CORS(app)  # Allow all origins for testing
# AWS S3 Configuration
AWS_ACCESS_KEY =os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY =os.environ.get("AWS_SECRET_ACCESS_KEY")
S3_BUCKET = 'closetlab'
S3_REGION = os.environ.get("AWS_REGION")  # e.g., 'us-east-1'

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=S3_REGION
)

print(client.list_database_names())
closet_lab_database = client["closet_lab_db"]
print("For reference, the names of the collections in the database are: " + str(closet_lab_database.list_collection_names()))

app = Flask(__name__)
CORS(app)  # Allow all origins for testing


def upload_base64_to_s3(base64_image, file_name, bucket_name ="closetlab"):
    """
    Upload a Base64-encoded image to an S3 bucket as a PNG file.

    Args:
        base64_image (str): The Base64-encoded image string.
        bucket_name (str): The name of the S3 bucket.
        file_name (str): The desired file name in S3.

    Returns:
        str: The URL of the uploaded image.
    """
    # Decode the Base64 string into binary data

    base64_data = base64.b64decode(base64_image.split(',')[1])
    # Upload the image to S3
    try:

        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=base64_data,
            ContentType='image/png',   # Adjust this if the image is not PNG
        # Optional: Make the image publicly readable
        )
        # Construct the file URL (Adjust according to your S3 bucket configuration)
        file_url = f"https://{bucket_name}.s3.amazonaws.com/{file_name}"
        print("File uploaded successfully:", file_url)
        return file_url
    except Exception as e:
        print("Error uploading file:", str(e))
        raise


@app.route('/api/test/', methods=['GET'])
def api_test():
    try:
        print("got request from frontend")
        return jsonify({"message": "hello from the other siiiide"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST route to add a new clothing item
@app.route('/api/v1/clothing-items', methods=['POST'])
def add_clothing_item():
    print("added one potentially")
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        image = data.get('image_link')
        # print(image)
        if not image:
            return jsonify({'error': 'Image data is required'}), 400

        name = data.get('name', '')
        image_link = "https://closetlab.s3.us-east-2.amazonaws.com/icon_cam.png"
        image = "https://closetlab.s3.us-east-2.amazonaws.com/icon_cam.png"
        user_id = data.get('user_id', dummy_user_id)
        brand_tags = data.get('brand_tags', [])
        color_tags = data.get('color_tags', [])
        other_tags = data.get('other_tags', [])
        type_tags = data.get('type_tags', [])
        donation_reminders = data.get('donation_reminders', False)

        item_id = db_add_clothing_item(
            name=name,
            image_link=image_link,
            image=image,
            user_id=user_id,
            brand_tags=brand_tags,
            color_tags=color_tags,
            other_tags=other_tags,
            type_tags=type_tags,
            donation_reminders=donation_reminders
        )

        return jsonify({'message': 'Clothing item added successfully', 'id': item_id}), 201

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

# POST route to add a day to the user's calendar
@app.route('/api/v1/add-day/<string:user_id>', methods=['POST'])
def add_day(user_id):
    try:
        print(f"got to the add-day route, data is {request.json}")
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        date = data.get('date')
        outfit_id = data.get('outfit_id')
        if not date or not outfit_id:
            return jsonify({'error': 'date and outfit_id are required'}), 400
        day_id = db_add_day(date, outfit_id, user_id)
        return jsonify({'message': 'Day added successfully', 'id': day_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        

# GET route to retrieve a clothing item by ID
@app.route('/api/v1/clothing-items/<string:item_id>', methods=['GET'])
def get_clothing_item(item_id):
    try:
        clothing_item = db_get_clothing_item(item_id)
        if clothing_item:
            return jsonify(clothing_item), 200
        else:
            return jsonify({'error': 'Clothing item not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST route to add tags to a clothing item by ID
@app.route('/api/v1/clothing-items/add-tag/<string:item_id>/', methods=['POST'])
def edit_clothing_item_tags(item_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        new_tag: str = data.get("new_tag")
        tag_type: str = data.get("tag_type")
        db_add_clothing_item_tag(item_id, new_tag, tag_type)
        return jsonify({'message': 'Tag added successfully', 'id': item_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}, 500)
    
# POST (not delete!) route to remove tags from a clothing item by ID
@app.route('/api/v1/clothing-items/remove-tag/<string:item_id>/', methods=['POST'])
def remove_clothing_item_tags(item_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        tag_name: str = data.get("tag_name")
        tag_type: str =  data.get("tag_type")
        db_remove_clothing_item_tag(item_id, tag_name, tag_type)
        return jsonify({'message': 'Data added successfully', 'id': item_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}, 500)

# POST route to update image link of a clothing item
@app.route('/api/v1/clothing-items/set-image-link/<string:item_id>/', methods=['POST'])
def update_image_link_item(item_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        image_link = upload_base64_to_s3(data.get("image_link"),file_name=f'{item_id}.png')
        print("The image link:")
        db_add_clothing_item_image(item_id, image_link)
        return jsonify({'message': 'Image set successfully', 'id': item_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}, 500)
    
# POST route to update donation reminders for an item
@app.route('/api/v1/clothing-items/donation-reminders/<string:item_id>/', methods=['POST'])
def set_donation_reminders(item_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        donation_reminders = data.get("donation_reminders")
        db_set_donation_reminders(item_id, donation_reminders)
        return jsonify({'message': 'Donation reminders updated successfully with ' + str(donation_reminders), 'id': item_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}, 500)
    
# GET route to retrieve all clothing items belonging to user, by user ID
# idsOnly = TRUE --> returns a list of ids instead of 
@app.route('/api/v1/clothing-items-get-all/<string:user_id>/<string:idsOnly>', methods=['GET'])
def get_all_clothing_items(user_id,idsOnly):
    try:
        # Convert user_id to ObjectId if necessary
        user_id_obj = ObjectId(user_id)
        item_collection = closet_lab_database["clothing_items"].find({"user_id": user_id_obj})
        returnItems = []
        print(user_id_obj)
        item_collection.batch_size(10000)
        #print(item_collection)
        for item in item_collection:
            #print(item)
            if idsOnly=='TRUE':
                returnItems.append(str(item["_id"]))
            else:
                returnItems.append(db_get_clothing_item(item["_id"]))
        return jsonify(returnItems), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE route to delete a clothing item by ID
@app.route('/api/v1/clothing-items/<string:item_id>', methods=['DELETE'])
def delete_clothing_item(item_id):
    try:
        success = db_delete_clothing_item(item_id)
        if success:
            return jsonify({'message': 'Clothing item deleted successfully'}), 200
        else:
            return jsonify({'error': 'Clothing item not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST route to add a new outfit
@app.route('/api/v1/outfits', methods=['POST'])
def add_outfit():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        name = data.get('name', 'Unnamed Outfit')
        user_id = data.get('user_id', dummy_user_id)
        items = data.get('items', [])
        clothing_item_collection = closet_lab_database["clothing_items"]
        itemInfoList = [clothing_item_collection.find_one({"_id": ObjectId(item)}) for item in items]
        newCollage = createCollage(itemInfoList)
        collage_s3 = upload_base64_to_s3(newCollage,f"{user_id}_collage_{name.replace(' ','_')}")
        print(collage_s3)
        outfit_id = db_add_outfit(
            user_id=user_id,
            name=name,
            items=items,
            collage=collage_s3
        )

        return jsonify({'message': 'Outfit added successfully', 'id': outfit_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# GET route to retrieve an outfit by ID
@app.route('/api/v1/outfits/<string:outfit_id>', methods=['GET'])
def get_outfit(outfit_id):
    try:
        outfit = db_get_outfit(outfit_id)
        if outfit:
            return jsonify(outfit), 200
        else:
            return jsonify({'error': 'Outfit not found'}), 404

    except Exception as e:
        #print(str(e))
        return jsonify({'error': str(e)}), 500
    
# GET route to retrieve all outfits belonging to user, by user ID
#12/5/24: returns all ObjectIDs of outfits belonging to user instead
@app.route('/api/v1/outfits-get-all/<string:user_id>', methods=['GET'])
def get_all_outfits(user_id):
    try:
        # Convert user_id to ObjectId if necessary
        user_id_obj = ObjectId(user_id)
        item_collection = closet_lab_database["outfits"].find({"user_id": user_id_obj})
        returnItems = []

        for item in item_collection:
            #returnItems.append(db_get_outfit(item["_id"]))
            returnItems.append(str(item["_id"]))

        return jsonify(returnItems), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
        

# POST route to set item ids for an outfit
@app.route('/api/v1/set-outfit-items', methods=['POST'])
def set_outfit_items():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        item_id = data.get("_id")
        newItemIDs = data.get("items", [])
        outfit_collection = closet_lab_database["outfits"]
        clothing_item_collection = closet_lab_database["clothing_items"]
        itemInfoList = [clothing_item_collection.find_one({"_id": ObjectId(item)}) for item in newItemIDs]
        newCollage = createCollage(itemInfoList)
        outfit_collection.update_one(
            {'_id': ObjectId(item_id)},
            {'$set': {'items': newItemIDs, 'collage':newCollage}},
        )
        return jsonify({'message': 'set outfit items successfully', '_id': item_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}, 500)

# DELETE route to delete an outfit by ID
@app.route('/api/v1/outfits/<string:outfit_id>', methods=['DELETE'])
def delete_outfit(outfit_id):
    try:
        success = db_delete_outfit(outfit_id)
        if success:
            return jsonify({'message': 'Outfit deleted successfully'}), 200
        else:
            return jsonify({'error': 'Outfit not found'}), 404

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
    
# GET route to retrieve or create a Calendar by userID
@app.route('/api/v1/calendar/<string:user_id>', methods=['GET'])
def get_calendar(user_id):
    try:
        calendar = db_get_calendar_by_user(user_id)
        if calendar:
            print("returning calendar, got back to app.py")
            return jsonify(calendar), 200
        else:
            return jsonify({'error': 'Outfit not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# GET route to retrieve a Day by its objectID
@app.route('/api/v1/get-day/<string:day_id>', methods=['GET'])
def get_day(day_id):
    try:
        day = db_get_day(day_id)
        if day:
            return jsonify(day), 200
        else:
            return jsonify({'error': 'Day not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@app.route('/api/v1/calendar-detailed/<string:user_id>', methods=['GET'])
def get_detailed_calendar(user_id):
    try:
        # Get the user's calendar
        calendar = db_get_calendar_by_user(user_id)
        if not calendar:
            return jsonify({'error': 'Calendar not found'}), 404

        day_collection = closet_lab_database["days"]
        detailed_days = []

        # Loop through the days in the calendar
        for day_id in calendar.get('days', []):
            day = day_collection.find_one({'_id': ObjectId(day_id)})
            if day:
                # Convert ObjectId fields to strings
                day['_id'] = str(day['_id'])
                day['calendar_id'] = str(day['calendar_id'])
                day['date'] = day['date'].strftime('%Y-%m-%d')
                
                # Retrieve detailed outfits
                outfits = []
                for outfit_id in day.get('outfits', []):
                    outfit = db_get_outfit(str(outfit_id))
                    if outfit:
                        outfit['_id'] = str(outfit['_id'])
                        outfits.append(outfit)
                day['outfits'] = outfits

                detailed_days.append(day)

        # Return the detailed calendar
        return jsonify({
            'calendar': {
                '_id': str(calendar['_id']),
                'days': detailed_days
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8100,debug=True)
