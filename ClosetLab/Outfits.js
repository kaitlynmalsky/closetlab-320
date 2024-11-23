import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, Keyboard, Button, StyleSheet, Text, Pressable, View, Image, ScrollView, FlatList, ImageBackground, Modal, TextInput } from 'react-native';
import styles, { testImg_b64, generateIcon } from './Stylesheet';
import React, { useState, useEffect } from 'react';
import { logFetch, getItem, base_url, getAllOutfitsForUser, postOutfit, deleteItem, getAllItemsForUser } from './APIContainer.js';
import color_tag_styles from './ColorTags.js';
import addTag from './AddTags.js';
import removeTag from './RemoveTags.js';
import { TagType, ClothingItem, Outfit} from './ClothingAndOutfits.js';
import { CheckBox } from 'react-native-elements';

const testItem = new Outfit(
    "Test Outfit 1",
    "12345", //db_id
    "67057228f80354e361ae2bf5"
);
testItem.addItemToOutfit("671d4e8c32b7d8628aef41d8")
testItem.addItemToOutfit("671d4f8c0cf12a6dbdba569c")


window.global_selectedOutfit = {
    db_id: "none",
    title: "Loading Outfit Name...",
    clothingItems: [],
};

window.global_outfitListNeedsUpdate = true;

export const addClothingItem = (visibleVar, setVisibleVar, navigation) => {

    const [text, setText] = useState("");
    function titleThis(text) {
        if (typeof (text) == 'undefined') return undefined;
        return text.trimLeft()[0].toUpperCase() + text.trim().substring(1).toLowerCase()
    }

    const [errorProp, setErrorProp] = useState(<Text></Text>);
    const defaultWrongNameMessage = "Invalid name!"
    const duplicateNameMessage = "That name already exists!"
    const mustHaveItemMessage = "Outfits must have at least one clothing item!"

    function generateErrorProp(thisText) {
        return setErrorProp(<Text style={styles.error_text}>{thisText}</Text>)
    }
    const [toggleCheckBox, setToggleCheckBox] = useState(false)

    const renderClothingItem = ({ item }) => (
        <View style={styles.listItem} key={item._id}>
            <View style={styles.spacer_row} key={item._id}>
                <View key={item._id}>
                    <Text>Name: {item.name}</Text>
                    <Text>objectID: {item._id}</Text>
                </View>
                
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

        if (returnedData.length > 0) {
            return (
            <ScrollView style={{ height: 400 }}>
                <CheckBox
                    title='Click Here'
                    checked={toggleCheckBox}
                    onPress={() => setToggleCheckBox(!toggleCheckBox)}
                />
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
        return (<Text>No Clothing Items Yet!</Text>) //default
    }

    const onAddItem = async () => {


        if (text === "") {
            return generateErrorProp(defaultWrongNameMessage)
        }

        try {
            newItem = new Outfit(titleThis(text), "12345", "67057228f80354e361ae2bf5") //TODO: replace 3rd arg with userId retrieved dynamically
            //options = {
            //    method: 'POST',
            //    headers: {
            //        Accept: 'application/json',
            //        'Content-Type': 'application/json',
            //        "Access-Control-Allow-Origin": "*"
            //    },
            //    body: JSON.stringify(newItem)
            //}
            //response = await fetch(base_url + 'v1/clothing-items', options);
            //if (!response.ok) {
            //    throw new Error('Network response was not ok');
            //}
            //const responseData = await response.json();
            //newItem.db_id = responseData.id;
            //console.log(newItem.db_id)
            //console.log('Data retrieved successfully:', responseData);
            //navigation.navigate('Home');
            //navigation.navigate('Clothing Item View');
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
                <Text style={styles.modalText}>Choose name of new outfit:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Type your name here…"
                    onChangeText={newText => { setText(newText); }}
                // onSubmitEditing={Keyboard.dismiss}
                />
                <Text style={styles.modalText}>Choose items:</Text>
                {getListOfClothingItems(getAllItemsForUser("67057228f80354e361ae2bf5"))}
                {errorProp}
                <Pressable
                    style={styles.button}
                    onPress={onAddItem}>
                    <Text style={styles.button_text}>Create new Item</Text>
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

export const deleteOutfit = (visibleVar, setVisibleVar, navigation) => {

    toDeleteID = window.global_selectedOutfit.db_id
    toDeleteName = window.global_selectedOutfit.title

    const onDeleteItem = async () => {
        try {

            options = {
                method: 'DELETE'
            }
            response = await fetch(base_url + 'v1/outfits/' + toDeleteID, options);
            if (!response.ok) {
                throw new Error('Network response was not ok for deletion');
            }
            //const responseData = await response.json();
            console.log(toDeleteID + ' deleted successfully');
            navigation.navigate('Home');
            window.global_outfitListNeedsUpdate = true
            navigation.navigate('Outfit List View');
        } catch (error) {
            console.error("Error in deletion:", error)
        }
        setVisibleVar(false)
    }

    return (<Modal
        animationType="slide"
        transparent={true}
        visible={visibleVar}
        onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setVisibleVar(false);
        }}>
        <View style={styles.container}>
            <View style={styles.modalView}>
                <Text style={styles.modalText}>Really delete "{toDeleteName}"?</Text>
                <Pressable
                    style={styles.button}
                    onPress={onDeleteItem}>
                    <Text style={styles.button_text}>Delete</Text>
                </Pressable>
                <Pressable
                    style={styles.button}
                    onPress={() => { setVisibleVar(false) }}>
                    <Text style={styles.button_text}>Go Back</Text>
                </Pressable>
            </View>
        </View>
    </Modal>);
}

export function OutfitListView() {
    const navigation = useNavigation();
    const onGoToHome = () => {
        window.global_outfitListNeedsUpdate = true
        navigation.navigate('Home');
    };

    const [addItemModalVisible, setAddItemModalVisible] = useState(false);
    const [deleteItemModalVisible, setDeleteItemModalVisible] = useState(false);

    //postOutfit({name:testItem.title, items:testItem.clothingItems, user_id:testItem.owner_db_id});

    function setGlobalViewOfItem(item) {
        console.log(item);
        window.global_selectedOutfit.db_id = item._id;
        if (item.db_id) {
            window.global_selectedOutfit.db_id = item.db_id;
        }
        window.global_selectedOutfit.title = item.name;
        window.global_selectedOutfit.clothingItems = item.items;
    }

    function onGoToSingleOutfitView_createFunc(outfit) {
        return () => {
            window.global_selectedOutfit = {
                db_id: outfit.db_id,
                title: outfit.title,
                clothingItems: outfit.clothingItems,
            };
            navigation.navigate('Single Outfit View');
        }
    }

    function onOpenDeleteItemModal_createFunc(item) {

        return () => {
            setGlobalViewOfItem(item)
            setDeleteItemModalVisible(true)
        }
    };

    const [returnedData, setReturnedData] = useState( getAllOutfitsForUser("67057228f80354e361ae2bf5"))

    const renderOutfitItem = ({ item }) => (
        <View style={styles.listItem} key={item._id}>

            <Pressable onPress={onGoToSingleOutfitView_createFunc(item)}>
                <View style={styles.spacer_row} key={item._id}>
                    <View key={item._id}>
                        <Text>Name: {item.name}</Text>
                        <Text>objectID: {item._id}</Text>
                    </View>
                    <Pressable style={styles.button_small} onPress={onOpenDeleteItemModal_createFunc(item)}>
                        {generateIcon('remove', styles.icon_general)}
                    </Pressable>
                </View>
            </Pressable>
        </View>
    );

    const getMaybeList = (returnedData) => {
        var defaultList = (<Text>No Outfits Yet!</Text>);
        if (returnedData.length > 0) {
            return (
                <FlatList
                    data={returnedData}
                    renderItem={renderOutfitItem}
                    keyExtractor={(item) => item._id}
                />
            );
        }
        return defaultList;
    };

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            if (window.global_outfitListNeedsUpdate){
                setReturnedData([])
                const response = await fetch(base_url+'v1/outfits-get-all/' + "67057228f80354e361ae2bf5");
        
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const responseData = await response.json();
            
                setReturnedData(responseData)
                window.global_outfitListNeedsUpdate = false
            }
          // The screen is focused
        });
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);


    return (<SafeAreaView style={styles.container}>
        <View style={styles.spacer_row}>
            <Pressable style={styles.button} onPress={onGoToHome}>
                {generateIcon('home', styles.button_iconCorner)}
            </Pressable>
            <Pressable style={styles.button_small} onPress={() => setAddItemModalVisible(true)}>
                {generateIcon('add', styles.icon_general)}
            </Pressable>
        </View>
        {getMaybeList(returnedData)}
        {addClothingItem(addItemModalVisible, setAddItemModalVisible, navigation)}
        {deleteOutfit(deleteItemModalVisible, setDeleteItemModalVisible, navigation)}
    </SafeAreaView>);
}



