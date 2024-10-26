import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, Button, StyleSheet, Text, Pressable, View, Image } from 'react-native';
import styles from './Stylesheet';
import React, { useState } from 'react';

//Tag Types. Items have 4 types of tags, each with any number of user-defined string properties.
const TagType = Object.freeze({
    COLOR: "color",
    BRAND: "brand",
    ITEM_TYPE: "type",
    OTHER: "other",
});

export class ClothingItem{
    db_id = ""; //ObjectId in MongoDB of this item
    user_id = ""; //ObjectId in MongoDB of the user this belongs to

    useDonationReminder = true; //specific donation reminder for this item; use with account settings
    
    name = "New Clothing Item"; //user-readable name of this item
    image_link = ""; //probably base64

    color_tags = []; //String arrays; initially all empty
    brand_tags = [];
    type_tags = [];
    other_tags = [];

    constructor(image, title, dbId, userId){
        this.name = title;
        this.image_link = image;
        this.db_id = dbId;
        this.user_id = userId;
    }

    setImage(stringInfo){
        this.image_link = stringInfo;
    }
    setIndividualDonationReminder(boolVal){
        this.useDonationReminder = !(!boolVal);
    }
    addPropertyToCategory(newStringProperty, category){
        const cat_process = category.toLowerCase().trim()
        if (cat_process===TagType.COLOR){
            return this.color_tags.push(newStringProperty)
        }
        else if (cat_process===TagType.ITEM_TYPE){
            return this.type_tags.push(newStringProperty)
        }
        else if (cat_process===TagType.BRAND){
            return this.brand_tags.push(newStringProperty)
        }
        else if (cat_process===TagType.OTHER){
            return this.other_tags.push(newStringProperty)
        }
        return false
    }
    removePropertyFromCategory(newStringProperty, category){ 
        const cat_process = category.toLowerCase().trim()
        if (cat_process===TagType.COLOR){
            oldSize = this.color_tags.length;
            this.color_tags = this.color_tags.filter(function(el) { return el !== newStringProperty; })
            return oldSize!==this.color_tags.length;
        }
        else if (cat_process===TagType.ITEM_TYPE){
            oldSize = this.type_tags.length;
            this.type_tags = this.type_tags.filter(function(el) { return el !== newStringProperty; })
            return oldSize!==this.color_tags.length;
        }
        else if (cat_process===TagType.BRAND){
            oldSize = this.brand_tags.length;
            this.brand_tags = this.brand_tags.filter(function(el) { return el !== newStringProperty; })
            return oldSize!==this.color_tags.length;
        }
        else if (cat_process===TagType.OTHER){
            oldSize = this.other_tags.length;
            this.other_tags = this.other_tags.filter(function(el) { return el !== newStringProperty; })
            return oldSize!==this.color_tags.length;
        }
        return false;
    }
}

export class Outfit{
    db_id = ""; //ObjectId in MongoDB of this item
    owner_db_id = ""; //ObjectId in MongoDB of the user this belongs to
    
    title = "New Outfit"; //user-readable name of this outfit

    clothingItems = [] //array of ClothingItems

    constructor(title, dbId, userId){
        this.title = title;
        this.db_id = dbId;
        this.owner_db_id = userId;
    }

    addItemToOutfit(item){
        this.clothingItems.push(item);
    }
    removeItemFromOutfit(item){ //also removes all non-ClothingItem items
        this.clothingItems = this.clothingItems.filter(
            function(itemEl) { 
                if (itemEl.title==null){return false}
                if (!itemEl.imageInfo==null){return false}
                return (itemEl.title !== item.title)||(itemEl.imageInfo !== item.imageInfo); 
            }
        )
    }
    setTitle(newTitle){
        this.title = newTitle;
    }
}

const testItem = new ClothingItem(
    "./assets/buttonIcons/icon_cam.png", 
    "Test Clothing Item", 
    "12345", 
    "67057228f80354e361ae2bf5"
);
testItem.addPropertyToCategory("shirt", TagType.ITEM_TYPE)
testItem.addPropertyToCategory("purple", TagType.COLOR)
testItem.addPropertyToCategory("yellow", TagType.COLOR)
testItem.addPropertyToCategory("Nike", TagType.BRAND)
testItem.setIndividualDonationReminder(true)

const sendClothingItem = async (clothingItemObject) => {
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

const getMostRecentClothingItemFromBackend = async () => {
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
    const returnObj = responseData[responseData.length-1]
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



export function ClothingItemView(userId, itemId){
    const navigation = useNavigation();
    const onGoToHome = () => {
        navigation.navigate('Home');
    };
    const [testElement, setTestElement] = useState(<Text style={styles.button_text}>Press to get Recent Uploaded Clothing Item</Text>);
    
    async function getDataFromBackend(){
        const newClothing = await getMostRecentClothingItemFromBackend();
        setTestElement(
        <View>
            <Text style={styles.button_text}>Name: {newClothing.name}</Text>
            <Text style={styles.button_text}>Image: {newClothing.image_link}</Text>
            <Text style={styles.button_text}>Brands: {newClothing.brand_tags.toString()}</Text>
            <Text style={styles.button_text}>Types: {newClothing.type_tags.toString()}</Text>
            <Text style={styles.button_text}>Colors: {newClothing.color_tags.toString()}</Text>
        </View>

        )
    }
      

    return (<SafeAreaView style={styles.container}>
        <View>
            <Pressable style={styles.button} onPress={onGoToHome}>
                <Text style={styles.button_text}>Go to Home</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={getDataFromBackend}>
                {testElement}
            </Pressable>
            
        </View>
    </SafeAreaView>);
}
