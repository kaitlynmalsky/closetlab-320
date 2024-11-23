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

function convertItemObjectID_ToListItem(id, itemCache){
    const defaultInfo = {
        name:"Error: no name found",
        image_link:"none"
    }
    const properItem = itemCache.reduce(
        (accumulator, currentValue) => {
            if (currentValue._id===id) { return currentValue }
            return accumulator
        },
        defaultInfo)
    return properItem.name + " " + properItem._id
}

export function reduceListToHumanReadable_Super(thisList, itemCache) {
    if (thisList.length == 0) { return <Text></Text> }
    
    if (thisList.sort) { thisList = thisList.sort(); } //there's no list.sort on mobile?
    const nl = "\n";
    if (thisList.reduce) {
        return thisList.reduce(
            (accumulator, currentValue, index) => {
                if (index == 0) { return accumulator }
                return <Text>{accumulator}{nl}{<Text >{convertItemObjectID_ToListItem(currentValue, itemCache)}</Text>}</Text>
            },
            <Text>{convertItemObjectID_ToListItem(thisList[0], itemCache)}</Text>)
    }
    return thisList

}

const testItem = new Outfit(
    "Test Outfit 1",
    "12345", //db_id
    "67057228f80354e361ae2bf5"
);
testItem.addItemToOutfit("671d4e8c32b7d8628aef41d8")
testItem.addItemToOutfit("671d4f8c0cf12a6dbdba569c")

function convertOutfitToMessage(outfit){
    return {
        name:outfit.title,
        user_id: outfit.owner,
        items: outfit.clothingItems
    }
}


window.global_selectedOutfit = {
    db_id: "none",
    title: "Loading Outfit Name...",
    clothingItems: [],
};

window.global_outfitListNeedsUpdate = true;

export const addOutfit = (visibleVar, setVisibleVar, navigation) => {

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
        return (<Text>No Clothing Items Yet!</Text>) //default
    }

    const onAddItem = async () => {


        if (text === "") {
            return generateErrorProp(defaultWrongNameMessage)
        }
        //check if at least one item is selected; empty outfits are not allowed
        var atLeastOneSelected_array = Object.entries(selectedItems).reduce(([prevK, prevV], [currK, currV],) => [prevK, prevV||currV], ["any", false])
        if (!atLeastOneSelected_array[1]) {
            return generateErrorProp(mustHaveItemMessage)
        }

        try {
            newItem = new Outfit(titleThis(text), "12345", "67057228f80354e361ae2bf5") //TODO: replace 3rd arg with userId retrieved dynamically
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
                body: JSON.stringify(convertOutfitToMessage(newItem))
            }
            response = await fetch(base_url + 'v1/outfits', options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            newItem.db_id = responseData.id;
            //console.log(newItem.db_id)
            console.log('Data retrieved successfully:', responseData);
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
    const [clothingItemCache, setClothingItemCache] = useState( getAllItemsForUser("67057228f80354e361ae2bf5"))

    const renderOutfitItem = ({ item }) => (
        <View style={styles.listItem} key={item._id}>

            <Pressable onPress={onGoToSingleOutfitView_createFunc(item)}>
                <View style={styles.spacer_row} key={item._id}>
                    <View key={item._id}>
                        <Text>Name: {item.name}</Text>
                        <Text>objectID: {item._id}</Text>
                        <Text>Items: {reduceListToHumanReadable_Super(item.items, clothingItemCache)}</Text>
                        
                    </View>
                    <Pressable style={styles.button_small} onPress={onOpenDeleteItemModal_createFunc(item)}>
                        {generateIcon('remove', styles.icon_general)}
                    </Pressable>
                </View>
            </Pressable>
        </View>
    );

    const getMaybeList = (returnedData) => {
        var defaultList = (<Text>Loading Outfits...</Text>);
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

                const response2 = await fetch(base_url+'v1/clothing-items-get-all/' + "67057228f80354e361ae2bf5");
                if (!response2.ok) {
                    throw new Error('Network response was not ok');
                }
                const itemCache = await response2.json();
                setClothingItemCache(itemCache)

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
        {addOutfit(addItemModalVisible, setAddItemModalVisible, navigation)}
        {deleteOutfit(deleteItemModalVisible, setDeleteItemModalVisible, navigation)}
    </SafeAreaView>);
}



