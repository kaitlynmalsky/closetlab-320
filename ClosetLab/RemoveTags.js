import styles from "./Stylesheet";
import React, { useState } from 'react';
import { Alert, Modal, Text, Pressable, View, Keyboard, TextInput } from 'react-native';
import color_tag_styles from "./ColorTags.js";
import { postItem, addItemTag, base_url, getItem, fetchAPI } from "./APIContainer.js";
import { ClothingItem } from "./ClothingAndOutfits.js"; // cycle?
import { Dropdown } from 'react-native-element-dropdown';




export default removeTag = (clothingItem, tagType, visibleVar, setVisibleVar) => {

    const tag_data = clothingItem[tagType + "_tags"];
    const dropdown_data = [];
    for (i = 0; i < tag_data.length; i++) {
        dropdown_data.push({ label: tag_data[i], value: tag_data[i] })
    }

    console.log(dropdown_data);

    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    function titleThis(text) {
        if (typeof (text) == 'undefined') return undefined;
        return text.trimLeft()[0].toUpperCase() + text.trim().substring(1).toLowerCase()
    }

    const [errorProp, setErrorProp] = useState(<Text></Text>);
    const defaultEmptyTagMessage = "No tag chosen.";
    const textArticle = (tagType == "other") ? "an" : "a";


    function generateErrorProp(thisText) {
        return setErrorProp(<Text style={styles.error_text}>{thisText}</Text>)
    }



    const onRemoveTag = async () => {

        
        if (value === "" || value == null) {
            return generateErrorProp(defaultEmptyTagMessage)
        }
        
        console.log("value is", value)
        const api_body = {
            tag_name: value,
            tag_type: tagType + "_tags"
        }
        console.log("api_body is", api_body)
        try {
            const response = await fetch(base_url + 'v1/clothing-items/remove-tag/' + clothingItem.db_id + '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(api_body),
            });
            const result = await response.json();
            console.log(result)
            console.log(tagType)
            clothingItem.removePropertyFromCategory(value, tagType)
            console.log(clothingItem[tagType+"_tags"])
        } catch (error) {
            console.error("Error:", error)
        }


        console.log(clothingItem)
        console.log(base_url)

        console.log(clothingItem[tagType + "_tags"])
        clothingItem.removePropertyFromCategory(clothingItem, tagType)
        window.global_itemListNeedsUpdate = true
        // clothingItem[tagType + "_tags"] = clothingItem[tagType + "_tags"].filter(tag => tag != value);
        console.log(clothingItem[tagType + "_tags"])
        setErrorProp(<Text></Text>)
        setVisibleVar(false)

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
                <Text style={styles.modalText}>Choose {textArticle} {tagType} tag to remove.</Text>
                {/* <TextInput
                    style={styles.input}
                    placeholder="Type your tag here…"
                    onChangeText={newText => { setText(newText); updateData(newText, tagType) }}
                    onSubmitEditing={Keyboard.dismiss}
                /> */}
                <Dropdown
                    placeholderStyle={styles.modalText}
                    data={dropdown_data}
                    style={styles.dropdown}
                    placeholder={!isFocus ? 'Select tag' : '...'}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    value={value}
                    maxHeight={300}

                    labelField="label"
                    valueField="value"
                    onChange={item => {
                        setValue(item.value);
                        setIsFocus(false);
                    }}
                />
                {errorProp}
                <Pressable
                    style={styles.button}
                    onPress={onRemoveTag}>
                    <Text style={styles.button_text}>Remove Tag</Text>
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

