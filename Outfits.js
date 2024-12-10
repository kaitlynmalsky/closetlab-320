import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, Keyboard, Button, StyleSheet, Text, Pressable, View, ScrollView, FlatList, Modal, TextInput, ImageBackground, Image } from 'react-native';
import styles, { testImg_b64, generateIcon } from './Stylesheet';
import React, { useState, useEffect } from 'react';
import { logFetch, getItem, base_url, getAllOutfitsForUser, postOutfit, deleteItem } from './APIContainer.js';
import { TagType, ClothingItem, Outfit, getLoading } from './ClothingAndOutfits.js';
import { editOutfit } from './EditOutfit.js';
import { CheckBox } from 'react-native-elements';
import { DayPicker } from "react-day-picker";

import { getCollage } from './ItemLayerOrganize.js'

function convertItemObjectID_ToListItem(id, itemCache) {
    const defaultInfo = {
        name: "Error: no name found",
        image_link: "none"
    }
    const properItem = itemCache.reduce(
        (accumulator, currentValue) => {
            if (currentValue._id === id) { return currentValue }
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

function convertOutfitToMessage(outfit) {
    return {
        name: outfit.title,
        user_id: outfit.owner,
        items: outfit.clothingItems
    }
}

window.global_cachedOutfits = []

window.global_selectedOutfit = {
    db_id: "none",
    title: "Loading Outfit Name...",
    clothingItems: [],
    collage: "none"
};

window.global_outfitListNeedsUpdate = true;

function removeDuplicateInCache(id) {
    if (window.global_cachedOutfits.length == 0) { return }
    for (i = window.global_cachedOutfits.length - 1; i >= 0; i--) {
        console.log(window.global_cachedOutfits[i])
        if ((window.global_cachedOutfits[i]) && (window.global_cachedOutfits[i]._id == id)) {
            window.global_cachedOutfits.pop(i)
        }
    }
}

export const addOutfit = (visibleVar, setVisibleVar, navigation, setSecondaryUpdate, clothingItemCache) => {

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
                    {
                        setSelectedItems(objMap(selectedItems,
                            (key, val) => {
                                if (key === item._id) { return !val }
                                else { return val }
                            }
                        ));
                    }
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
        if (returnedData instanceof Promise) {
            return (<Text>Loading Clothing Items...</Text>)
        } //TODO: detect difference between not collected and not collected *yet*
        if (returnedData.length === undefined) { return (<Text>Loading Clothing Items...</Text>) }
        if ((returnedData.length > 0)) {
            if ((returnedData.length != Object.keys(selectedItems).length)) {
                //console.log(returnedData.length)
                //setSelectedItems({});
                for (item in returnedData) {
                    selectedItems[returnedData[item]._id] = false;
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


        if (text === "") {
            return generateErrorProp(defaultWrongNameMessage)
        }
        //check if at least one item is selected; empty outfits are not allowed
        var atLeastOneSelected_array = Object.entries(selectedItems).reduce(([prevK, prevV], [currK, currV],) => [prevK, prevV || currV], ["any", false])
        if (!atLeastOneSelected_array[1]) {
            return generateErrorProp(mustHaveItemMessage)
        }

        try {
            newItem = new Outfit(titleThis(text), "12345", "67057228f80354e361ae2bf5") //TODO: replace 3rd arg with userId retrieved dynamically
            Object.entries(selectedItems).forEach(
                ([k, v]) => {
                    if (v) {
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
            setSecondaryUpdate(true)
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
                {getListOfClothingItems(clothingItemCache)}
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

export const calendarAdd = (visibleVar, setVisibleVar, navigation, setSecondaryUpdate) => {
    dummy_user = "67057228f80354e361ae2bf5"
    const [selected, setSelected] = useState();
    async function addAPI() {
        date_notime = new Date(new Date(selected).setHours(0, 0, 0))
        console.log("called addAPI() in calendarAdd with date = " + selected + " and outfitID = " + window.global_selectedOutfit.db_id);
        try {
            options = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ date: selected, outfit_id: window.global_selectedOutfit.db_id })
            }

            response = await fetch(base_url + 'v1/add-day/' + dummy_user, options);
            if (!response.ok) {
                throw new Error('Network response was not ok for day addition');
            }
        } catch (error) {
            console.error("Error in addition:", error)
        }
        setVisibleVar(false);
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
                <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={setSelected}
                    footer={
                        selected ? `Selected: ${selected.toLocaleDateString()}` : "Pick a day."
                    }
                />
                <View style={styles.spacer_row}>
                    <Pressable onPress={() => setVisibleVar(false)} style={styles.button}><Text style={styles.button_text}>Cancel</Text></Pressable>
                    <Pressable style={styles.button} onPress={() => addAPI()}><Text style={styles.button_text}>Add to calendar</Text></Pressable>
                </View>
            </View>
        </View>
    </Modal>);
}

export const deleteOutfit = (visibleVar, setVisibleVar, navigation, setSecondaryUpdate) => {

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
            setSecondaryUpdate(true)
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

    const [stillLoading, setLoading] = useState(false);


    const onGoToHome = () => {
        if (stillLoading) { return }
        window.global_outfitListNeedsUpdate = true
        navigation.navigate('Home');
    };

    const [addItemModalVisible, setAddItemModalVisible] = useState(false);
    const [deleteItemModalVisible, setDeleteItemModalVisible] = useState(false);

    //postOutfit({name:testItem.title, items:testItem.clothingItems, user_id:testItem.owner_db_id});

    function setGlobalViewOfItem(item) {
        window.global_selectedOutfit.db_id = item._id;
        if (item.db_id) {
            window.global_selectedOutfit.db_id = item.db_id;
        }
        window.global_selectedOutfit.title = item.name;
        window.global_selectedOutfit.clothingItems = item.items;
        window.global_selectedOutfit.collage = item.collage;
    }

    function onGoToSingleOutfitView_createFunc(outfit) {
        return () => {
            setGlobalViewOfItem(outfit)
            navigation.navigate('Single Outfit View');
        }
    }

    function onOpenDeleteItemModal_createFunc(item) {

        return () => {
            setGlobalViewOfItem(item)
            setDeleteItemModalVisible(true)
        }
    };

    const [secondaryUpdateRequired, setSecondaryUpdate] = useState(false);
    const [returnedData, setReturnedData] = useState(window.global_cachedOutfits)
    const [clothingItemCache, setClothingItemCache] = useState([])

    async function updatePage() {
        setLoading(true)
        setReturnedData([])
        window.global_cachedOutfits = []
        setSecondaryUpdate(false)
        //console.log("finished items")
        const response = await fetch(base_url + 'v1/outfits-get-all/' + "67057228f80354e361ae2bf5");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const outfitIDs = await response.json();
        for (index in outfitIDs) {
            const response_outfit = await fetch(base_url + 'v1/outfits/' + outfitIDs[index]);
            if (!response_outfit.ok) {
                throw new Error('Network response was not ok');
            }
            const outfit = await response_outfit.json();
            removeDuplicateInCache(outfit["_id"])
            window.global_cachedOutfits.push(outfit)
            setReturnedData(window.global_cachedOutfits)
        }

        setLoading(false)
        if ((clothingItemCache.length != undefined) && (clothingItemCache.length == 0)) {
            const response2 = await fetch(base_url + 'v1/clothing-items-get-all/' + "67057228f80354e361ae2bf5" + "/FALSE");
            if (!response2.ok) {
                throw new Error('Network response was not ok');
            }
            const itemCache = await response2.json();
            setClothingItemCache(itemCache)
        }
        //console.log("finished outfits")

        window.global_outfitListNeedsUpdate = false
    }

    if (secondaryUpdateRequired) {
        updatePage()
    }
    //<Text>Items: {reduceListToHumanReadable_Super(item.items, clothingItemCache)}</Text>


    const renderOutfitItem = ({ item }) => (
        <View style={styles.listItem} key={item._id}>

            <Pressable onPress={onGoToSingleOutfitView_createFunc(item)}>
                <View style={styles.spacer_row} key={item._id}>
                    <View key={item._id}>
                        <Text>Name: {item.name}</Text>
                        <Text>objectID: {item._id}</Text>
                        {getCollage(false, true, false, item.collage)}
                    </View>
                    <Pressable style={styles.button_small} onPress={onOpenDeleteItemModal_createFunc(item)}>
                        {generateIcon('remove', styles.icon_general)}
                    </Pressable>
                </View>
            </Pressable>
        </View>
    );

    const getMaybeList = (returnedData) => {
        var defaultList = (<Text></Text>);
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
            if (window.global_outfitListNeedsUpdate) {
                updatePage()
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
        {getLoading(stillLoading, "Loading Outfits...")}
        {addOutfit(addItemModalVisible, setAddItemModalVisible, navigation, setSecondaryUpdate, clothingItemCache)}
        {deleteOutfit(deleteItemModalVisible, setDeleteItemModalVisible, navigation, setSecondaryUpdate)}
    </SafeAreaView>);
}


export function SingleOutfitView() {
    const navigation = useNavigation();
    const onGoToHome = () => {
        window.global_outfitListNeedsUpdate = true
        navigation.navigate('Home');
    };
    const onGoToList = () => {
        //window.global_outfitListNeedsUpdate = true
        navigation.navigate('Outfit List View');
    };
    const newOutfit = new Outfit(
        window.global_selectedOutfit.title,
        window.global_selectedOutfit.db_id,
        "67057228f80354e361ae2bf5"
    );
    newOutfit.clothingItems = window.global_selectedOutfit.clothingItems
    cur_outfit_id = window.global_selectedOutfit.db_id;

    const [needUpdate, setNeedUpdate] = useState(true)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [collage, setCollage] = useState(<Text>Loading Collage...</Text>)
    const [clothingItemCache, setClothingItemCache] = useState([])
    const [calendarModalVisible, setCalendarModalVisible] = useState(false);

    //setCollage(window.global_selectedOutfit.collage)
    getCollage(setCollage, needUpdate, setNeedUpdate)
    async function updatePage() {
        if ((clothingItemCache.length != undefined) && (clothingItemCache.length == 0)) {
            const response2 = await fetch(base_url + 'v1/clothing-items-get-all/' + "67057228f80354e361ae2bf5" + '/FALSE');
            if (!response2.ok) {
                throw new Error('Network response was not ok');
            }
            const itemCache = await response2.json();
            setClothingItemCache(itemCache)
        }
    }

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            updatePage()
            // The screen is focused
        });
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    //console.log(newOutfit)
    return (<SafeAreaView style={styles.container}>
        <View style={styles.container}>
            <View style={styles.spacer_row_mobile}>
                <Pressable style={styles.button} onPress={onGoToHome}>
                    {generateIcon('home', styles.button_iconCorner)}
                </Pressable>
                <Pressable style={styles.button} onPress={onGoToList}>
                    <Text style={styles.button_text}>Back to Outfits</Text>
                </Pressable>
            </View>
            <View style={styles.container_underTopRow}>
                <Text style={[styles.text, styles.pad_text]}>Name: {newOutfit.title}</Text>
                <Text style={[styles.text, styles.pad_text]}>objectID: {newOutfit.db_id}</Text>
                <View>
                    {collage}
                </View>
                <View style={styles.container}>
                    <View style={styles.spacer_row_even}>
                        <Pressable style={styles.button_outfit_2x2} onPress={() => setEditModalVisible(true)}>
                            <Text style={styles.button_text}>Edit Outfit</Text>
                        </Pressable>
                        <Pressable style={styles.button_outfit_2x2} onPress={() => setCalendarModalVisible(true)}>
                            <Text style={styles.button_text}>Save Outfit{"\n"}to Calendar</Text>
                        </Pressable>
                    </View>
                    <View style={styles.spacer_row_even}>
                        <Pressable style={styles.button_outfit_2x2} onPress={() => setDeleteModalVisible(true)}>
                            <Text style={styles.button_text}>Discard Outfit</Text>
                        </Pressable>
                        <Pressable style={styles.button_outfit_2x2} onPress={onGoToList}>
                            <Text style={styles.button_text}>Back to Outfits</Text>
                        </Pressable>
                    </View>
                </View>

                <Text>{"\n"}</Text>
            </View>

        </View>
        {deleteOutfit(deleteModalVisible, setDeleteModalVisible, navigation, setNeedUpdate)}
        {editOutfit(editModalVisible, setEditModalVisible, navigation, false, clothingItemCache, newOutfit)}
        {calendarAdd(calendarModalVisible, setCalendarModalVisible, navigation)}
    </SafeAreaView>);
}

