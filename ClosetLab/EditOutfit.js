import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, Keyboard, Button, StyleSheet, Text, Pressable, View, ScrollView, FlatList, Modal, TextInput, ImageBackground, Image } from 'react-native';
import styles, { testImg_b64, generateIcon } from './Stylesheet';
import React, { useState, useEffect } from 'react';
import { logFetch, getItem, base_url, getAllOutfitsForUser, postOutfit, deleteItem, getAllItemsForUser } from './APIContainer.js';
import { TagType, ClothingItem, Outfit} from './ClothingAndOutfits.js';
import { CheckBox } from 'react-native-elements';

import {getCollage} from './ItemLayerOrganize.js'
export const editOutfit = (visibleVar, setVisibleVar, navigation,setSecondaryUpdate, clothingItemCache, currentOutfit) => {

    const [errorProp, setErrorProp] = useState(<Text></Text>);
    const defaultWrongNameMessage = "Invalid name!"
    const duplicateNameMessage = "That name already exists!"
    const mustHaveItemMessage = "Outfits must have at least one clothing item!"

    function generateErrorProp(thisText) {
        return setErrorProp(<Text style={styles.error_text}>{thisText}</Text>)
    }
    //print(currentOutfit.clothingItems)
    const [selectedItems, setSelectedItems] = useState({});//maps objectID->selected-or-not boolean
    function objMap(obj, func) {  //obj is the dict, func is (key, value) => new value
        //why is this not built-in
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(k, v)]));
    }

    const renderClothingItem = ({ item }) => (
        <View style={styles.listItem} key={item._id}>
            <View style={styles.spacer_row} key={item._id}>
                <View key={item._id}>
                    <Text>Name: {item.name}</Text>
                    <Text>objectID: {item._id}</Text>
                </View>
                <CheckBox
                    checked={selectedItems[item._id]}
                    onPress={() => //when a dict is in a useState, the whole dict must be replaced 
                        {setSelectedItems(objMap(selectedItems, 
                            (key, val)=>{
                                if (key===item._id){ return !val }
                                else{ return val }
                            }
                        ));}
                    }
                />
            </View>
        </View>
    );
    //<CheckBox
    //              key={item._id}
    //              disabled={false}
    //              value={toggleCheckBox}
    //              onValueChange={(newValue) => setToggleCheckBox(newValue)}
    //            />

    const getListOfClothingItems = (returnedData) => {
        if (returnedData instanceof Promise){ 
            return (<Text>Loading Clothing Items...</Text>)
        } //TODO: detect difference between not collected and not collected *yet*
        if (returnedData.length===undefined){return (<Text>Loading Clothing Items...</Text>)}
        if ((returnedData.length > 0)) {
            if ((returnedData.length!=Object.keys(selectedItems).length)){
                //console.log(returnedData.length)
                //setSelectedItems({});
                for (item in returnedData){
                    selectedItems[returnedData[item]._id]=false;
                }
                for (index in currentOutfit.clothingItems){
                    selectedItems[currentOutfit.clothingItems[index]] = true
                }
            }
            
            return (
            <ScrollView style={{ height: 400 }}>
                
                <FlatList
                    data={returnedData}
                    renderItem={renderClothingItem}
                    keyExtractor={(item) => {
                        return item._id;
                    }}
                />
            </ScrollView>
            )
        }
        return (<Text>Loading Items...</Text>) //default
    }

    const onAddItem = async () => {

        //check if at least one item is selected; empty outfits are not allowed
        var atLeastOneSelected_array = Object.entries(selectedItems).reduce(([prevK, prevV], [currK, currV],) => [prevK, prevV||currV], ["any", false])
        if (!atLeastOneSelected_array[1]) {
            return generateErrorProp(mustHaveItemMessage)
        }

        try {
            newItem = new Outfit(currentOutfit.title, currentOutfit.db_id, currentOutfit.user_id) //TODO: replace 3rd arg with userId retrieved dynamically
            Object.entries(selectedItems).forEach(
                ([k,v])=>{
                    if (v){
                        newItem.addItemToOutfit(k)
                    }
                }
            )
            options = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    _id: currentOutfit.db_id,
                    items: newItem.clothingItems
                })
            }
            response = await fetch(base_url + 'v1/set-outfit-items', options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            newItem.db_id = responseData.id;
            //console.log(newItem.db_id)
            console.log('Data retrieved successfully:', responseData);
            window.global_outfitListNeedsUpdate = true;
            navigation.navigate('Home');
            navigation.navigate('Outfit List View');
        } catch (error) {
            console.error("Error:", error)
        }
        //if (clothingItem[tagType + "_tags"].includes(titleThis(text))) {
        //  return generateErrorProp(duplicateNameMessage)
        //}

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
                <Text style={styles.modalText}>Choose items:</Text>
                {getListOfClothingItems(clothingItemCache)}
                {errorProp}
                <Text style={styles.error_text}>Changing outfit items will take you back to the outfit list.</Text>
                <View style={styles.spacer_row}>
                    <Pressable
                        style={styles.button}
                        onPress={onAddItem}>
                        <Text style={styles.button_text}>Change Outfit Items</Text>
                    </Pressable>
                    <Pressable
                        style={styles.button}
                        onPress={() => { setErrorProp(<Text></Text>); setVisibleVar(false) }}>
                        <Text style={styles.button_text}>Cancel</Text>
                    </Pressable>
                </View>
                
            </View>
        </View>
    </Modal>);
}