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
#

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