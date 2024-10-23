import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { getClothes } from '../api/api';

export default function ClothesGallery({ navigation }) {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    const fetchedClothes = await getClothes();
    setClothes(fetchedClothes);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Tag', { clothesId: item._id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clothes}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        numColumns={3}
      />
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate('Upload')}
      >
        <Image
          source={require('../assets/upload-icon.png')}
          style={styles.uploadIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flex: 1/3,
    aspectRatio: 1,
    margin: 1,
  },
  image: {
    flex: 1,
  },
  uploadButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
});
