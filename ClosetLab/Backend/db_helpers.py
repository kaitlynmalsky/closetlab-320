from pymongo import MongoClient
from bson.objectid import ObjectId
import datetime

# Initialize the database connection
client = MongoClient("mongodb+srv://kmalsky:Cw1ccE8Bq5VV8Lwe@closetlab.q7yvq.mongodb.net/?retryWrites=true&w=majority&appName=ClosetLab")  
closet_lab_database = client["closet_lab_db"]

dummy_user_id = "67057228f80354e361ae2bf5"

def db_add_clothing_item(name: str = "", image_link: str = "", image: str = "", user_id: str = dummy_user_id,
                         brand_tags: list = None, color_tags: list = None,
                         other_tags: list = None, type_tags: list = None,
                         donation_reminders: bool = False):
    try:
        print("Adding clothing item to database")
        clothing_item_collection = closet_lab_database["clothing_items"]
        clothing_item = {
            "name": name,
            "image_link": image_link,
            "image": image,  
            "user_id": ObjectId(user_id),
            "brand_tags": brand_tags or [],
            "color_tags": color_tags or [],
            "other_tags": other_tags or [],
            "type_tags": type_tags or [],
            "donation_reminders": donation_reminders,
            "date_added": datetime.datetime.now(tz=datetime.timezone.utc),
            "last_worn": datetime.datetime.now(tz=datetime.timezone.utc)
        }
        result = clothing_item_collection.insert_one(clothing_item)
        print("Clothing item added successfully with ID:", result.inserted_id)
        return str(result.inserted_id)
    except Exception as e:
        print("Error adding item to database:", str(e))
        raise

def db_add_clothing_item_tag(object_id: str, new_tag: str, tag_type: str):
    try:
        print("Editing clothing item " + object_id + " in database")
        if not object_id or not new_tag or not tag_type:
            print("error: object_id, new_tag, or tag_type was not defined")
            return
        if (tag_type not in ["color_tags", "type_tags", "brand_tags", "other_tags"]):
            print("error: invalid tag type")
            return
        clothing_item = db_get_clothing_item(object_id)
        clothing_item[tag_type].append(new_tag)
        clothing_item_collection = closet_lab_database["clothing_items"]
        clothing_item_collection.update_one(
            {'_id': ObjectId(object_id)},
            {'$set': {tag_type: clothing_item[tag_type]}},
        )
    except Exception as e:
        print("Error updating clothing item in database:", str(e))

def db_add_clothing_item_image(object_id: str, image_link: str):
    try:
        print("Adding image_link (URI) " + image_link + " to clothing item " + object_id)
        if not object_id:
            print("error: object_id was not defined")
            return
        if not image_link:
            print("error: image_link not defined")
            return
        clothing_item = db_get_clothing_item(object_id)
        #clothing_item.image_link = image_link
        #clothing_item.image = image_link
        clothing_item_collection = closet_lab_database["clothing_items"]
        clothing_item_collection.update_one(
            {'_id': ObjectId(object_id) },
            {'$set': {"image_link": image_link}}
        )
        clothing_item_collection.update_one(
            {'_id': ObjectId(object_id) },
            {'$set': {"image": image_link}}
        )
    except Exception as e:
        print("Error updating clothing item in database:", str(e))

def db_set_donation_reminders(object_id: str, donation_reminders: bool):
    try:
        print("Setting donation reminders of clothing item " + object_id + " to " + str(donation_reminders))
        if not object_id:
            print("error: object_id was not defined")
            return
        if donation_reminders == None:
            print("error: donation_reminders not defined")
            return
        #clothing_item = db_get_clothing_item(object_id)
        clothing_item_collection = closet_lab_database["clothing_items"]
        clothing_item_collection.update_one(
            {'_id': ObjectId(object_id)},
            {'$set': {"donation_reminders": donation_reminders}}
        )
    except Exception as e:
        print("Error updating clothing item in database:", str(e))

def db_remove_clothing_item_tag(object_id: str, tag_name: str, tag_type: str):
    try:
        print("Removing tag " + tag_name + " from clothing item " + object_id + " in database")
        if not object_id or not tag_name or not tag_type:
            print("error: object_id, tag_name, or tag_type was not defined")
            return
        if tag_type not in ["color_tags", "type_tags", "brand_tags", "color_tags"]:
            print("error: invalid tag type")
            return
        clothing_item = db_get_clothing_item(object_id)
        clothing_item[tag_type].remove(tag_name)
        clothing_item_collection = closet_lab_database["clothing_items"]
        clothing_item_collection.update_one(
            {'_id': ObjectId(object_id)},
            {'$set': {tag_type: clothing_item[tag_type]}}
        )
    except Exception as e:
        print("Error updating clothing item in database: ", str(e))


def db_get_clothing_item(object_id: str):
    try: 
        print("Getting clothing item from database")
        clothing_item_collection = closet_lab_database["clothing_items"]
        document = clothing_item_collection.find_one({"_id": ObjectId(object_id)})
        if document:
            # Convert ObjectId to string for JSON serialization
            document['_id'] = str(document['_id'])
            document['user_id'] = str(document.get('user_id', ''))
            document['brand_tags'] = document.get('brand_tags', [])
            document['color_tags'] = document.get('color_tags', [])
            document['other_tags'] = document.get('other_tags', [])
            document['type_tags'] = document.get('type_tags', [])
        return document
    except Exception as e:
        print("Error getting clothing item from database:", str(e))
        raise

def db_delete_clothing_item(object_id: str):
    try:
        print("Deleting clothing item from database")
        clothing_item_collection = closet_lab_database["clothing_items"]
        result = clothing_item_collection.delete_one({"_id": ObjectId(object_id)})
        if result.deleted_count == 0:
            print("No clothing item found with that ID.")
            return False
        print("Clothing item deleted successfully.")
        return True
    except Exception as e:
        print("Error removing item from database:", str(e))
        raise

def db_get_outfit(object_id: str):
    try:
        print("Getting outfit from database")
        outfit_collection = closet_lab_database["outfits"]
        document = outfit_collection.find_one({"_id": ObjectId(object_id)})
        if document:
            document['_id'] = str(document['_id'])
            document['user_id'] = str(document.get('user_id', ''))
            document['items'] = [str(item) for item in document.get('items', [])]
        return document
    except Exception as e:
        print("Error getting outfit from database:", str(e))
        raise

def db_add_outfit(user_id: str = dummy_user_id, name: str = "Unnamed Outfit", items: list = None):
    try:
        print("Adding outfit to database")
        outfit_collection = closet_lab_database["outfits"]
        item_ids = [ObjectId(item) for item in (items or [])]
        outfit = {
            "user_id": ObjectId(user_id),
            "name": name,
            "items": item_ids
        }
        result = outfit_collection.insert_one(outfit)
        print("Outfit added successfully with ID:", result.inserted_id)
        return str(result.inserted_id)
    except Exception as e:
        print("Error adding outfit to database:", str(e))
        raise

def db_delete_outfit(object_id: str):
    try:
        print("Deleting outfit from database")
        outfit_collection = closet_lab_database["outfits"]
        result = outfit_collection.delete_one({"_id": ObjectId(object_id)})
        if result.deleted_count == 0:
            print("No outfit found with that ID.")
            return False
        print("Outfit deleted successfully.")
        return True
    except Exception as e:
        print("Error deleting outfit from database:", str(e))
        raise

def db_get_calendar_by_user(user_id: str = dummy_user_id):
    try:
        print("Getting calendar of user " + str(user_id) + " from database")
        calendar_collection = closet_lab_database["calendars"]
        calendar = calendar_collection.find_one({'user_id': ObjectId(user_id)})
        if calendar == None:
            print("Calendar was not found for user " + user_id + ", creating one")
            calendar = {
                'user_id': user_id,
                'days': []
            }
            calendar_collection.insert_one(calendar)
        else:
            print("Existing calendar for user " + user_id + " found")
        return calendar
    except Exception as e:
        print("Error getting calendar from database:", str(e))
        raise
    

def db_add_day(date: datetime, user_id: str = dummy_user_id):
    try:
        print("Adding calendar day " + str(datetime) + " to user " + user_id)
        day_collection = closet_lab_database["days"]
        calendar = db_get_calendar_by_user(user_id)
        day = {
            'calendar_id': calendar['_id'],
            'outfits': [],
            'date': date # not sure about this, check if typing was dpne right
        }
        day_collection.insert_one(day)
    except Exception as e:
        print("Error adding day to database:", str(e))
        raise

# def db_add_outfit_to_day(date: datetime, outfit_id: str,  user_id: str = dummy_user_id):
#     try:
#         print("Adding outfit " + outfit_id + " to day " + str(date))
#         day_collection = closet_lab_database["days"]
#         day = day_collection.find_one({'day': date}) # go back and fix this?
#         if day == None:
#             # Add the needed day if it doesn't exist already.
#             db_add_day(date, user_id)