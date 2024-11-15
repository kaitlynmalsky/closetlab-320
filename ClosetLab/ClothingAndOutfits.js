import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, Keyboard, Button, StyleSheet, Text, Pressable, View, Image, ScrollView, FlatList, ImageBackground, Modal, TextInput } from 'react-native';
import styles, { testImg_b64, generateIcon } from './Stylesheet';
import React, { useState, useEffect } from 'react';
import { logFetch, getItem, base_url, getAllItemsForUser, postItem, deleteItem } from './APIContainer.js';
import color_tag_styles from './ColorTags.js';
import addTag from './AddTags.js';
import removeTag from './RemoveTags.js';


//Tag Types. Items have 4 types of tags, each with any number of user-defined string properties.
export const TagType = Object.freeze({
    COLOR: "color",
    BRAND: "brand",
    ITEM_TYPE: "type",
    OTHER: "other",
});

//global variable: can be used on all pages. 
//used to track the selected clothing item for the single item view.
window.global_selectedClothingItem = {
    _id: 'none',
    name: "Loading Name...",
    imageUri: "none",
    brands: "Loading Brands...",
    colors: "Loading Colors...",
    types: "Loading Item Types...",
    others: "Loading Other Properties...",
    donationReminder: true,

    imageNeedsUpdate: false,

};

window.global_itemListNeedsUpdate = false

//takes a list of strings [b, a, c]. returns "a, b, c".
// as of 10/31 3:46 pm, returns a text component instead
export function reduceListToHumanReadable(thisList) {
    if (thisList.length == 0) { return "" }
    if (thisList.sort) { thisList = thisList.sort(); } //there's no list.sort on mobile?
    if (thisList.reduce) {
        return thisList.reduce(
            (accumulator, currentValue, index) => {
                if (index == 0) { return <Text style={getStyleForTag(accumulator)}>{accumulator}</Text> }
                return <Text>{<Text style={getStyleForTag(accumulator)}>{accumulator}</Text>} {<Text style={getStyleForTag(currentValue)}>{currentValue}</Text>}</Text>
            },
            thisList[0])
    }
    return thisList

}

function getStyleForTag(tag) {
    const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "white", "black", "gray", "brown"]
    if (!colors.includes(tag)) {
        return [styles.tag, styles.tag_default];
    }
    return [styles.tag, color_tag_styles[tag]]
}

export class ClothingItem {
    db_id = ""; //ObjectId in MongoDB of this item
    user_id = ""; //ObjectId in MongoDB of the user this belongs to

    useDonationReminder = true; //specific donation reminder for this item; use with account settings
    lastWornTime = Date(Date.today);

    name = "New Clothing Item"; //user-readable name of this item
    image_link = ""; //probably base64

    color_tags = []; //String arrays; initially all empty
    brand_tags = [];
    type_tags = [];
    other_tags = [];

    constructor(image, title, dbId, userId) {
        this.name = title;
        this.image_link = image;
        this.db_id = dbId;
        this.user_id = userId;
    }

    setImage(stringInfo) {
        this.image_link = stringInfo;
    }
    setIndividualDonationReminder(boolVal) {
        this.useDonationReminder = !(!boolVal);
    }
    addPropertyToCategory(newStringProperty, category) {
        const cat_process = category.toLowerCase().trim()
        if (cat_process === TagType.COLOR) {
            return this.color_tags.push(newStringProperty)
        }
        else if (cat_process === TagType.ITEM_TYPE) {
            return this.type_tags.push(newStringProperty)
        }
        else if (cat_process === TagType.BRAND) {
            return this.brand_tags.push(newStringProperty)
        }
        else if (cat_process === TagType.OTHER) {
            return this.other_tags.push(newStringProperty)
        }
        return false
    }
    removePropertyFromCategory(newStringProperty, category) {
        const cat_process = category.toLowerCase().trim()
        if (cat_process === TagType.COLOR) {
            const oldSize = this.color_tags.length;
            this.color_tags = this.color_tags.filter(function (el) { return el !== newStringProperty; })
            return oldSize !== this.color_tags.length;
        }
        else if (cat_process === TagType.ITEM_TYPE) {
            const oldSize = this.type_tags.length;
            this.type_tags = this.type_tags.filter(function (el) { return el !== newStringProperty; })
            return oldSize !== this.type_tags.length;
        }
        else if (cat_process === TagType.BRAND) {
            const oldSize = this.brand_tags.length;
            this.brand_tags = this.brand_tags.filter(function (el) { return el !== newStringProperty; })
            return oldSize !== this.brand_tags.length;
        }
        else if (cat_process === TagType.OTHER) {
            const oldSize = this.other_tags.length;
            this.other_tags = this.other_tags.filter(function (el) { return el !== newStringProperty; })
            return oldSize !== this.other_tags.length;
        }
        return false;
    }
}

export class Outfit {
    db_id = ""; //ObjectId in MongoDB of this item
    owner_db_id = ""; //ObjectId in MongoDB of the user this belongs to

    title = "New Outfit"; //user-readable name of this outfit

    clothingItems = [] //array of ClothingItems

    constructor(title, dbId, userId) {
        this.title = title;
        this.db_id = dbId;
        this.owner_db_id = userId;
    }

    addItemToOutfit(item) {
        this.clothingItems.push(item);
    }
    removeItemFromOutfit(item) { //also removes all non-ClothingItem items
        this.clothingItems = this.clothingItems.filter(
            function (itemEl) {
                if (itemEl.title == null) { return false }
                if (!itemEl.imageInfo == null) { return false }
                return (itemEl.title !== item.title) || (itemEl.imageInfo !== item.imageInfo);
            }
        )
    }
    setTitle(newTitle) {
        this.title = newTitle;
    }
}


const testItem = new ClothingItem(
    "./assets/buttonIcons/icon_cam.png",
    "Test Clothing Item",
    "12345", //userID
    "67057228f80354e361ae2bf5"
);
testItem.addPropertyToCategory("shirt", TagType.ITEM_TYPE)
testItem.addPropertyToCategory("red", TagType.COLOR)
testItem.addPropertyToCategory("blue", TagType.COLOR)
testItem.addPropertyToCategory("Nike", TagType.BRAND)
testItem.setIndividualDonationReminder(true)


export function ClothingItemView() {

    const navigation = useNavigation();
    const onGoToHome = () => {
        navigation.navigate('Home');
    };
    const onGoToList = () => {
        navigation.navigate('Clothing Item View');
    };
    const onGoToCam = () => {
        navigation.navigate('Camera');
    };
    const [brandModalVisible, setBrandModalVisible] = useState(false);
    const [colorModalVisible, setColorModalVisible] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [otherModalVisible, setOtherModalVisible] = useState(false);
    const [removeBrandModalVisible, setRemoveBrandModalVisible] = useState(false);
    const [removeColorModalVisible, setRemoveColorModalVisible] = useState(false);
    const [removeTypeModalVisible, setRemoveTypeModalVisible] = useState(false);
    const [removeOtherModalVisible, setRemoveOtherModalVisible] = useState(false);


    //const [testElement, setTestElement] = useState(<Text style={styles.button_text}>Press to get Recent Uploaded Clothing Item</Text>);

    //const [itemInfo, setItemInfo] = useState(defaultView);
    //console.log(window.global_selectedClothingItem._id)
    const newClothing = new ClothingItem(
        window.global_selectedClothingItem.imageUri,
        window.global_selectedClothingItem.name,
        window.global_selectedClothingItem._id,
        "12345", //TODO change to userID
    );
    newClothing.color_tags = window.global_selectedClothingItem.colors
    newClothing.brand_tags = window.global_selectedClothingItem.brands
    newClothing.type_tags = window.global_selectedClothingItem.types
    newClothing.other_tags = window.global_selectedClothingItem.others
    newClothing.setIndividualDonationReminder(window.global_selectedClothingItem.donationReminder)
    const [visibleDonationsOn, setVisibleDonationsOn] = useState(newClothing.useDonationReminder);
    const [visibleImageURI, setVisibleImageURI] = useState(window.global_selectedClothingItem.imageUri);
    
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            //console.log("page loaded :)")
            setVisibleImageURI(window.global_selectedClothingItem.imageUri)
          // The screen is focused
        });
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);





    function generateTagItem(lead, listElement, modalFuncAdd, modalFuncRemove) {
        return (<View style={styles.container_tag}>
            <View >
                <Text style={styles.text_Left}>{lead}: {listElement}</Text>
            </View>
            <View style={styles.container_row}>
                <Pressable style={styles.button_small} onPress={() => modalFuncAdd(true)}>
                    {generateIcon('add', styles.icon_general)}
                </Pressable>
                <Pressable style={styles.button_small} onPress={() => modalFuncRemove(true)}>
                    {generateIcon('remove', styles.icon_general)}
                </Pressable>
            </View>
        </View>

        )
    }

    function toggleDonations() {
        window.global_selectedClothingItem.donationReminder = !window.global_selectedClothingItem.donationReminder
        setVisibleDonationsOn(window.global_selectedClothingItem.donationReminder)
        newClothing.useDonationReminder = window.global_selectedClothingItem.donationReminder
        //TODO: update database with new individual donation reminder setting
    }


    return (<SafeAreaView style={styles.container}>
        <View style={styles.container}>
            <View style={styles.spacer_row_mobile}>
                <Pressable style={styles.button} onPress={onGoToHome}>
                    {generateIcon('home', styles.button_iconCorner)}
                </Pressable>
                <Pressable style={styles.button} onPress={onGoToList}>
                    <Text style={styles.button_text}>Back to List</Text>
                </Pressable>
                <Pressable style={styles.button_corner} onPress={toggleDonations}>
                    {generateIcon(visibleDonationsOn ? "donation_on" : "donation_off", styles.button_donation)}
                </Pressable>
            </View>
            <View style={styles.container_underTopRow}>
                <Text style={[styles.text, styles.pad_text]}>Name: {newClothing.name}</Text>
                <Text style={[styles.text, styles.pad_text]}>objectID: {newClothing.db_id}</Text>
                <View style={styles.spacer_row}>
                    <ImageBackground resizeMode="contain" style={
                        {
                            width: 300,
                            height: 300,
                            borderWidth: 1,
                            borderColor: 'black',
                            justifyContent: 'space-between',
                        }
                    }
                        source={{ uri: visibleImageURI }}>
                        <Pressable style={styles.icon_corner} onPress={onGoToCam}>
                            {generateIcon('add', styles.button_iconCorner)}
                        </Pressable>

                    </ImageBackground>
                </View>

                <Text>{"\n"}</Text>
                <ScrollView>
                    {generateTagItem("Brands", reduceListToHumanReadable(newClothing.brand_tags), setBrandModalVisible, setRemoveBrandModalVisible)}
                    {generateTagItem("Colors", reduceListToHumanReadable(newClothing.color_tags), setColorModalVisible, setRemoveColorModalVisible)}
                    {generateTagItem("Types", reduceListToHumanReadable(newClothing.type_tags), setTypeModalVisible, setRemoveBrandModalVisible)}
                    {generateTagItem("Other", reduceListToHumanReadable(newClothing.other_tags), setOtherModalVisible, setRemoveOtherModalVisible)}
                    <Text style={styles.text}>Donation Reminders: <Text style={[styles.tag, styles.tag_default]}>{(String)(visibleDonationsOn)}</Text></Text>
                </ScrollView>
            </View>

            {addTag(newClothing, "brand", brandModalVisible, setBrandModalVisible)}
            {addTag(newClothing, "color", colorModalVisible, setColorModalVisible)}
            {addTag(newClothing, "type", typeModalVisible, setTypeModalVisible)}
            {addTag(newClothing, "other", otherModalVisible, setOtherModalVisible)}
            {removeTag(newClothing, "brand", removeBrandModalVisible, setRemoveBrandModalVisible)}
            {removeTag(newClothing, "color", removeColorModalVisible, setRemoveColorModalVisible)}
            {removeTag(newClothing, "type", removeTypeModalVisible, setRemoveTypeModalVisible)}
            {removeTag(newClothing, "other", removeOtherModalVisible, setRemoveOtherModalVisible)}



        </View>
    </SafeAreaView>);
}


export function OutfitListView() {
    const navigation = useNavigation();
    const onGoToHome = () => {
        navigation.navigate('Home');
    };


    // function onGoToSingleItemView_createFunc(item) {

    //     return () => {
    //         window.global_selectedClothingItem._id = item._id;
    //         window.global_selectedClothingItem.name = item.name;
    //         window.global_selectedClothingItem.imageUri = item.image_link;
    //         window.global_selectedClothingItem.colors = item.color_tags;
    //         window.global_selectedClothingItem.brands = item.brand_tags;
    //         window.global_selectedClothingItem.types = item.type_tags;
    //         window.global_selectedClothingItem.others = item.other_tags;
    //         window.global_selectedClothingItem.donationReminder = item.donation_reminders;
    //         navigation.navigate('Single Clothing Item View');
    //     }
    // };

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

    const returnedData = getAllItemsForUser("67057228f80354e361ae2bf5")

    const renderOutfitItem = ({ item }) => (
        <View style={styles.listItem} key={item.db_id}>
            <Pressable onPress={onGoToSingleOutfitView_createFunc(item)}>
                <Text>Outfit Title: {item.title}</Text>
                <Text>objectID: {item.db_id}</Text>

                {/* For each clothing item in the outfit, display it in a similar "blue box" format */}
                <FlatList
                    data={item.clothingItems}
                    renderItem={({ item: clothingItem }) => (
                        <View style={styles.clothingItemBox}>
                            <Text>Name: {clothingItem.name}</Text>
                            <Text>objectID: {clothingItem.db_id}</Text>
                            <Image
                                resizeMode="contain"
                                style={{
                                    width: 300,
                                    height: 300,
                                    borderWidth: 1,
                                    borderColor: 'black'
                                }}
                                source={{ uri: clothingItem.image_link }}
                            />
                            <Text>Colors: {reduceListToHumanReadable(clothingItem.color_tags)}</Text>
                            <Text>Brands: {reduceListToHumanReadable(clothingItem.brand_tags)}</Text>
                        </View>
                    )}
                    keyExtractor={(clothingItem) => clothingItem.db_id}
                />
            </Pressable>
        </View>
    );


    //React complains if every item in a list doesn't have a unique 'key' prop
    // const renderListItem = ({ item }) => (
    //     <View style={styles.listItem} key={item._id}>
    //         <Pressable onPress={onGoToSingleItemView_createFunc(item)}>
    //             <Text>Name: {item.name}</Text>
    //             <Text>objectID: {item._id}</Text>
    //             <Image resizeMode="contain" style={
    //                 {
    //                     width: 300,
    //                     height: 300,
    //                     borderWidth: 1,
    //                     borderColor: 'black'
    //                 }
    //             }
    //                 source={{ uri: item.image }} />
    //             <Text>Colors: {reduceListToHumanReadable(item.color_tags)}</Text>
    //             <Text>Brands: {reduceListToHumanReadable(item.brand_tags)}</Text>
    //         </Pressable>
    //     </View>
    // );

    // const getMaybeList = (returnedData) => {
    //     var defaultList = (<Text>No Clothing Items Yet!</Text>)
    //     if (returnedData.length > 0) {
    //         return (<FlatList
    //             data={returnedData}
    //             renderItem={renderListItem}
    //             keyExtractor={(item) => {
    //                 return item._id;
    //             }}
    //         />)
    //     }
    //     return defaultList
    // }

    const getMaybeList = (returnedData) => {
        var defaultList = (<Text>No Outfits Yet!</Text>);
        if (returnedData.length > 0) {
            return (
                <FlatList
                    data={returnedData}
                    renderItem={renderOutfitItem}
                    keyExtractor={(item) => item.db_id}
                />
            );
        }
        return defaultList;
    };


    return (<SafeAreaView style={styles.container}>
        <Pressable style={styles.button} onPress={onGoToHome}>
            {generateIcon('home', styles.button_iconCorner)}
        </Pressable>
        {getMaybeList(returnedData)}
    </SafeAreaView>);
}



export const addClothingItem = (visibleVar, setVisibleVar, navigation) => {

    const [text, setText] = useState("");
    function titleThis(text) {
        if (typeof (text) == 'undefined') return undefined;
        return text.trimLeft()[0].toUpperCase() + text.trim().substring(1).toLowerCase()
    }

    const [errorProp, setErrorProp] = useState(<Text></Text>);
    const defaultWrongNameMessage = "Invalid Name!"
    const duplicateNameMessage = "That name already exists!"

    function generateErrorProp(thisText) {
        return setErrorProp(<Text style={styles.error_text}>{thisText}</Text>)
    }

    const onAddItem = async () => {


        if (text === "") {
            return generateErrorProp(defaultWrongNameMessage)
        }

        try {
            newItem = new ClothingItem("none", titleThis(text), "", "67057228f80354e361ae2bf5") //TODO: replace 4th arg with userId retrieved dynamically
            options = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify(newItem)
            }
            response = await fetch(base_url + 'v1/clothing-items', options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            newItem.db_id = responseData.id;
            console.log(newItem.db_id)
            console.log('Data retrieved successfully:', responseData);
            navigation.navigate('Home');
            navigation.navigate('Clothing Item View');
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
                <Text style={styles.modalText}>Choose name of new item:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Type your name here…"
                    onChangeText={newText => { setText(newText); }}
                // onSubmitEditing={Keyboard.dismiss}
                />
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

export const deleteClothingItem = (visibleVar, setVisibleVar, navigation) => {

    toDeleteID = window.global_selectedClothingItem._id
    toDeleteName = window.global_selectedClothingItem.name

    const onDeleteItem = async () => {
        try {

            options = {
                method: 'DELETE'
            }
            response = await fetch(base_url + 'v1/clothing-items/' + toDeleteID, options);
            if (!response.ok) {
                throw new Error('Network response was not ok for deletion');
            }
            //const responseData = await response.json();
            console.log(toDeleteID + ' deleted successfully');
            navigation.navigate('Home');
            navigation.navigate('Clothing Item View');
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

export function ClothingItemListView() {
    const navigation = useNavigation();
    const onGoToHome = () => {
        navigation.navigate('Home');
    };
    //addClothingItem

    const [addItemModalVisible, setAddItemModalVisible] = useState(false);
    const [deleteItemModalVisible, setDeleteItemModalVisible] = useState(false);
    
    //setReturnedData(intermediateList)
    //console.log(intermediateList)

    function setGlobalViewOfItem(item) {
        window.global_selectedClothingItem._id = item._id;
        if (item.db_id) {
            window.global_selectedClothingItem._id = item.db_id;
        }
        window.global_selectedClothingItem.name = item.name;
        window.global_selectedClothingItem.imageUri = item.image_link;
        window.global_selectedClothingItem.colors = item.color_tags;
        window.global_selectedClothingItem.brands = item.brand_tags;
        window.global_selectedClothingItem.types = item.type_tags;
        window.global_selectedClothingItem.others = item.other_tags;
        window.global_selectedClothingItem.donationReminder = item.donation_reminders;
    }

    function onGoToSingleItemView_createFunc(item) {
        return () => {
            setGlobalViewOfItem(item)
            navigation.navigate('Single Clothing Item View');
        }
    };

    function onOpenDeleteItemModal_createFunc(item) {

        return () => {
            setGlobalViewOfItem(item)
            setDeleteItemModalVisible(true)
        }
    };



    //React complains if every item in a list doesn't have a unique 'key' prop
    const renderListItem = ({ item }) => (
        <View style={styles.listItem} key={item._id}>

            <Pressable onPress={onGoToSingleItemView_createFunc(item)}>
                <View style={styles.spacer_row} key={item._id}>
                    <View key={item._id}>
                        <Text>Name: {item.name}</Text>
                        <Text>objectID: {item._id}</Text>
                    </View>
                    <Pressable style={styles.button_small} onPress={onOpenDeleteItemModal_createFunc(item)}>
                        {generateIcon('remove', styles.icon_general)}
                    </Pressable>
                </View>
                <ImageBackground resizeMode="contain" style={
                    {
                        width: 300,
                        height: 300,
                        borderWidth: 1,
                        borderColor: 'black',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-end',
                    }
                }
                    source={{ uri: item.image }} >
                </ImageBackground>
                <Text>Colors: {reduceListToHumanReadable(item.color_tags)}</Text>
                <Text>Brands: {reduceListToHumanReadable(item.brand_tags)}</Text>
            </Pressable>
        </View>
    );

    const getMaybeList = (returnedData) => {
        var defaultList = (<Text>No Clothing Items Yet!</Text>)
        if (returnedData.length > 0) {
            return (<FlatList
                data={returnedData}
                renderItem={renderListItem}
                keyExtractor={(item) => {
                    return item._id;
                }}
            />)
        }
        return defaultList
    }

    //TODO: regenerate page on addItem and on deleteItem
    
    const [returnedData, setReturnedData] = useState([]);
    intermediateList = getAllItemsForUser("67057228f80354e361ae2bf5") //TODO: use actual user ID
    if (intermediateList.length != returnedData.length) {
        setReturnedData(intermediateList)
    }
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            console.log("page loaded !!")
            if (window.global_itemListNeedsUpdate){
                console.log("tried update")
                const response = await fetch(base_url+'v1/clothing-items-get-all/' + "67057228f80354e361ae2bf5");
        
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const responseData = await response.json();
            
                setReturnedData(responseData)
                window.global_itemListNeedsUpdate = false
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

        {addClothingItem(addItemModalVisible, setAddItemModalVisible, navigation)}
        {deleteClothingItem(deleteItemModalVisible, setDeleteItemModalVisible, navigation)}
        {getMaybeList(returnedData)}
    </SafeAreaView>);
}




const sendClothingItem = async (clothingItemObject) => { //deprecated: use APIContainer functions instead
    try {
        //const response = {ok:true}
        console.log(JSON.stringify(clothingItemObject))
        const response = await fetch("http://localhost:8000/api/v1/post-clothes", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clothingItemObject),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        //const responseData = "failed";
        clothingItemObject.db_id = responseData.id;
        console.log('Data retrieved successfully:', responseData);
        //setTestElement(<Text >{responseData}</Text>)
    } catch (error) {
        console.error('Error sending data:', error);
    }
};


//sendClothingItem(testItem);

const getMostRecentClothingItemFromBackend = async () => { //deprecated: use APIContainer functions instead
    try {
        //const response = {ok:true}
        const response = await fetch("http://localhost:8000/api/v1/get-clothes", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        //const responseData = "failed";
        console.log('Data retrieved successfully:', responseData);
        const returnObj = responseData[responseData.length - 1]
        const returnItem = new ClothingItem(
            returnObj.image_link,
            returnObj.name,
            returnObj.user_id,
            returnObj.id
        );
        returnItem.brand_tags = returnObj.brand_tags
        returnItem.color_tags = returnObj.color_tags
        returnItem.type_tags = returnObj.type_tags
        returnItem.other_tags = returnObj.other_tags

        return returnItem;
    } catch (error) {
        console.error('Error sending data:', error);
    }
};