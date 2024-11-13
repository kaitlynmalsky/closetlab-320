import pytest
from Backend.app import app as flask_app
from mongomock import MongoClient
from bson import ObjectId

@pytest.fixture
def app():
    flask_app.config['TESTING'] = True
    flask_app.config['MONGO_URI'] = 'mongodb://localhost:27017/test_db'  # Use test database
    flask_app.db_client = MongoClient()  # Mocked MongoDB client
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

def test_add_clothing_item(client):
    valid_user_id = str(ObjectId())
    response = client.post('/api/v1/clothing-items', json={
        'name': 'Test Item',
        'image_link': 'image_link_example',
        'user_id': valid_user_id,
        'brand_tags': ['Nike'],
        'color_tags': ['Red'],
        'type_tags': ['Shirt'],
        'other_tags': ['Casual'],
        'donation_reminders': True
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'id' in data
    assert data['message'] == 'Clothing item added successfully'

def test_get_clothing_item(client):
    valid_user_id = str(ObjectId())
    # First, add an item to retrieve
    post_response = client.post('/api/v1/clothing-items', json={
        'name': 'Test Item',
        'image_link': 'image_link_example',
        'user_id': valid_user_id,
    })
    assert post_response.status_code == 201
    item_id = post_response.get_json()['id']

    # Now, retrieve the item
    get_response = client.get(f'/api/v1/clothing-items/{item_id}')
    assert get_response.status_code == 200
    data = get_response.get_json()
    assert data['name'] == 'Test Item'
    assert data['image_link'] == 'image_link_example'

def test_delete_clothing_item(client):
    valid_user_id = str(ObjectId())
    # Add an item to delete
    post_response = client.post('/api/v1/clothing-items', json={
        'name': 'Item to Delete',
        'image_link': 'image_link_example',
        'user_id': valid_user_id,
    })
    assert post_response.status_code == 201
    item_id = post_response.get_json()['id']

    # Delete the item
    delete_response = client.delete(f'/api/v1/clothing-items/{item_id}')
    assert delete_response.status_code == 200
    data = delete_response.get_json()
    assert data['message'] == 'Clothing item deleted successfully'

    # Verify the item no longer exists
    get_response = client.get(f'/api/v1/clothing-items/{item_id}')
    assert get_response.status_code == 404


def test_add_tag_to_clothing_item(client):
    # Add an item first
    valid_user_id = str(ObjectId())
    post_response = client.post('/api/v1/clothing-items', json={
        'name': 'Item with Tag',
        'image_link': 'image_link_example',
        'user_id': valid_user_id,
    })
    assert post_response.status_code == 201
    item_id = post_response.get_json()['id']

    # Add a tag
    response = client.post(f'/api/v1/clothing-items/add-tag/{item_id}/', json={
        'new_tag': 'Casual',
        'tag_type': 'other_tags'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Tag added successfully'
    assert data['id'] == item_id

def test_remove_tag_from_clothing_item(client):
    # Add an item first
    valid_user_id = str(ObjectId())
    post_response = client.post('/api/v1/clothing-items', json={
        'name': 'Item with Tag to Remove',
        'image_link': 'image_link_example',
        'user_id': valid_user_id,
    })
    assert post_response.status_code == 201
    item_id = post_response.get_json()['id']

    # Remove a tag
    response = client.post(f'/api/v1/clothing-items/remove-tag/{item_id}/', json={
        'tag_name': 'Casual',
        'tag_type': 'other_tags'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Data added successfully'
    assert data['id'] == item_id

def test_update_image_link(client):
    # Add an item first
    valid_user_id = str(ObjectId())
    post_response = client.post('/api/v1/clothing-items', json={
        'name': 'Item to Update Image',
        'image_link': 'old_image_link',
        'user_id': valid_user_id,
    })
    assert post_response.status_code == 201
    item_id = post_response.get_json()['id']

    # Update image link
    response = client.post(f'/api/v1/clothing-items/set-image-link/{item_id}/', json={
        'image_link': 'new_image_link'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Image set successfully'
    assert data['id'] == item_id

def test_set_donation_reminders(client):
    # Add an item first
    valid_user_id = str(ObjectId())
    post_response = client.post('/api/v1/clothing-items', json={
        'name': 'Item to Update Donation',
        'image_link': 'image_link_example',
        'user_id': valid_user_id,
    })
    assert post_response.status_code == 201
    item_id = post_response.get_json()['id']

    # Update donation reminders
    response = client.get(f'/api/v1/clothing-items/donation-reminders/{item_id}/', json={
        'donation_reminders': True
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Donation reminders updated successfully'
    assert data['id'] == item_id

def test_get_all_clothing_items(client):
    valid_user_id = str(ObjectId())

    # Add multiple items for the user
    for i in range(3):
        response = client.post('/api/v1/clothing-items', json={
            'name': f'Item {i}',
            'image_link': f'image_link_{i}',
            'user_id': valid_user_id,
        })
        assert response.status_code == 201

    # Get all items for the user
    response = client.get(f'/api/v1/clothing-items-get-all/{valid_user_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 3
    for i, item in enumerate(data):
        assert item['name'] == f'Item {i}'

def test_add_get_delete_outfit(client):
    valid_user_id = str(ObjectId())

    # Add an outfit
    post_response = client.post('/api/v1/outfits', json={
        'name': 'Casual Outfit',
        'user_id': valid_user_id,
        'items': []
    })
    assert post_response.status_code == 201
    outfit_id = post_response.get_json()['id']

    # Get the outfit
    get_response = client.get(f'/api/v1/outfits/{outfit_id}')
    assert get_response.status_code == 200
    outfit_data = get_response.get_json()
    assert outfit_data['name'] == 'Casual Outfit'

    # Delete the outfit
    delete_response = client.delete(f'/api/v1/outfits/{outfit_id}')
    assert delete_response.status_code == 200
    assert delete_response.get_json()['message'] == 'Outfit deleted successfully'

    # Confirm deletion
    confirm_response = client.get(f'/api/v1/outfits/{outfit_id}')
    assert confirm_response.status_code == 404