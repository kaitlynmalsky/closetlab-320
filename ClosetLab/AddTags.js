import styles from "./Stylesheet";
import React, { useState } from 'react';
import { Alert, Modal, Text, Pressable, View, Keyboard, TextInput } from 'react-native';
import { postItem } from './APIContainer.js';
import color_tag_styles from "./ColorTags.js";
import { addItemTag, base_url, getItem } from "./APIContainer.js";



export default addTag = (clothingItem, tagType, visibleVar, setVisibleVar) => {

  const [text, setText] = useState("");
  const [data, setData] = useState({ "new_tag": '', "tag_type": '' })
  const updateData = (text, type) => {
    setData({
      "new_tag": titleThis(text),
      "tag_type": type + "_tags"
    })
    console.log("data updated", data)
  }
  function titleThis(text) {
    if (typeof (text) == 'undefined') return undefined;
    return text.trimLeft()[0].toUpperCase() + text.trim().substring(1).toLowerCase()
  }

  const [errorProp, setErrorProp] = useState(<Text></Text>);
  const defaultWrongNameMessage = "Invalid Name!"
  const duplicateNameMessage = "That tag already exists!"

  function generateErrorProp(thisText) {
    return setErrorProp(<Text style={styles.error_text}>{thisText}</Text>)
  }



  const onAddTag = async () => {
    try {
      const response = await fetch(base_url + 'v1/clothing-items/add-tag/' + clothingItem.db_id + "/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log(result)
    } catch (error) {
      console.error("Error:", error)
    }

    if (text === "") {
      return generateErrorProp(defaultWrongNameMessage)
    }
    if (clothingItem[tagType + "_tags"].includes(titleThis(text))) {
      return generateErrorProp(duplicateNameMessage)

    }

    //TODO: changes are not saved to database, and reset visually on re-retrieval
    console.log(clothingItem)
    console.log(base_url)

    clothingItem.addPropertyToCategory(titleThis(text), tagType)
    setErrorProp(<Text></Text>)
    setVisibleVar(false)

    //clothingItem.addPropertyToCategory(text, tagType)

  }
  console.log(text, tagType)

  return (<Modal
    animationType="slide"
    transparent={true}
    visible={visibleVar}
    onRequestClose={() => {
      Alert.alert('Modal has been closed.');
      setErrorProp(<Text></Text>)
      setVisibleVar(false);
    }}>
    <View style={styles.container}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Currently adding new {tagType} to {clothingItem.name}</Text>
        <TextInput
          style={styles.input}
          placeholder="Type your tag here…"
          onChangeText={newText => { setText(newText); updateData(newText, tagType) }}
          onSubmitEditing={Keyboard.dismiss}
        />
        {errorProp}
        <Pressable
          style={styles.button}
          onPress={onAddTag}>
          <Text style={styles.button_text}>Add Tag</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => { setErrorProp(<Text></Text>); setVisibleVar(false) }}>
          <Text style={styles.button_text}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  </Modal>);
}
