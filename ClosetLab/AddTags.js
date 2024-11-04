import styles from "./Stylesheet";
import React, {useState} from 'react';
import {Alert, Modal, Text, Pressable, View, Keyboard, TextInput} from 'react-native';
import { postItem } from './APIContainer.js';
import color_tag_styles from "./ColorTags.js";

export default addTag = (clothingItem, tagType, visibleVar, setVisibleVar) => {

    const [text, setText] = useState("");
    function titleThis(text){return text.trimLeft()[0].toUpperCase() + text.trim().substring(1).toLowerCase()}

    const [errorProp, setErrorProp] = useState(<Text></Text>);
    const defaultWrongNameMessage = "Invalid Name!"
    const duplicateNameMessage = "That tag already exists!"

    function generateErrorProp(thisText){
        return setErrorProp(<Text style={styles.error_text}>{thisText}</Text>)
    }

    function onAddTag(){
        if (text===""){
            return generateErrorProp(defaultWrongNameMessage)
        }
        if (clothingItem[tagType+"_tags"].includes(titleThis(text))){
            return generateErrorProp(duplicateNameMessage)

        }
        else{
            //TODO: changes are not saved to database, and reset visually on re-retrieval

            clothingItem.addPropertyToCategory(titleThis(text), tagType)
            setErrorProp(<Text></Text>)
            setVisibleVar(false)
        }
        //clothingItem.addPropertyToCategory(text, tagType)
        
    }

    

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
                onChangeText={newText => setText(newText)}
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
              onPress={() => {setErrorProp(<Text></Text>);setVisibleVar(false)}}>
              <Text style={styles.button_text}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>);
}
