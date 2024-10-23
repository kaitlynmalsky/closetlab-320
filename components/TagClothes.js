import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { tagClothes } from '../api/api';

export default function TagClothes({ route, navigation }) {
  const { clothesId } = route.params;
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [customTags, setCustomTags] = useState('');

  const handleSubmit = async () => {
    const tags = {
      type,
      color,
      customTags: customTags.split(',').map(tag => tag.trim()),
    };

    const success = await tagClothes(clothesId, tags);
    if (success) {
      navigation.navigate('Gallery');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type (e.g., shirt, pants)"
        value={type}
        onChangeText={setType}
      />
      <TextInput
        style={styles.input}
        placeholder="Color"
        value={color}
        onChangeText={setColor}
      />
      <TextInput
        style={styles.input}
        placeholder="Custom tags (comma-separated)"
        value={customTags}
        onChangeText={setCustomTags}
      />
      <Button title="Submit Tags" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
