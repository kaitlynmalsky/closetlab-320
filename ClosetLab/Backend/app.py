from flask import Flask, jsonify, request, make_response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins for testing


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