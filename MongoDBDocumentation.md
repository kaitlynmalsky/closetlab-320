# MongoDB Documentation

## Databases
Database list:
* calendars
    * `_id: ObjectID`
    * `user_id: ObjectID`
    * `days: ObjectID[]`
* clothing_items
    * `_id: ObjectID`
    * `name: String`
    * `image_link: String`
    * `tags: ObjectID[]`
    * `user_id: Object_ID`
* days
    * `_id: ObjectID`
    * `calendar_id: ObjectID`
    * `outfits: ObjectID[]`
    * `date: Date`
* outfits
    * `_id: ObjectID`
    * `name: String`
    * `items: ObjectID[]`
* tags
    * `_id: ObjectID[]`
    * `user_id: ObjectID`
    * `name: String`
    * `donation_reminders_on: Boolean`
* users
    * `_id: ObjectID`
    * `username: String`
    * `password: String`
    * `calendar: ObjectID`

## Connection Details
username: kmalsky

password: Cw1ccE8Bq5VV8Lwe

connection link: mongodb+srv://kmalsky:Cw1ccE8Bq5VV8Lwe@closetlab.q7yvq.mongodb.net/
