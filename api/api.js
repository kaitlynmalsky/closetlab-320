import axios from 'axios';

const API_URL = 'http://your-backend-url.com/api';

export const uploadClothes = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });

    const response = await axios.post(`${API_URL}/clothes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.clothesId;
  } catch (error) {
    console.error('Error uploading clothes:', error);
    return null;
  }
};

export const tagClothes = async (clothesId, tags) => {
  try {
    await axios.put(`${API_URL}/clothes/${clothesId}/tags`, tags);
    return true;
  } catch (error) {
    console.error('Error tagging clothes:', error);
    return false;
  }
};

export const getClothes = async () => {
  try {
    const response = await axios.get(`${API_URL}/clothes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clothes:', error);
    return [];
  }
};
