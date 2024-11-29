import { logFetch, getItem, base_url, getAllOutfitsForUser, postOutfit, deleteItem, getAllItemsForUser } from './APIContainer.js';
import { SafeAreaView, Keyboard, Button, StyleSheet, Text, Pressable, View, ScrollView, FlatList, Modal, TextInput, ImageBackground, Image } from 'react-native';
//items are listed from most outer-wear-ish to most inner-wear-ish

export const ItemLayerType = Object.freeze({
    TOP: "top",
    BOTTOM: "bottom",
    SHOE: "shoe",
    SOCK: "sock",
    ACC: "accessory",
});

const topItems = [
    "coat", 
    "hoodie", 
    "sweatshirt",
    "cardigan", 
    "jacket", 
    "fleece",
    "sweater", 
    "shirt", 
    "blouse", 
    "polo", 
    "tank top",
    "undershirt"
]

const bottomItems = [
    "overalls", 
    "skirt",
    "shorts", 
    "pants", 
    "leggings", 
    "hose", 
    "jacket", 
    "jacket", 
    "jacket", 
]

const shoeItems = [
    "shoe", 
    "shoes", 
    "flip flops", 
    "flip-flops", 
    "slippers", 
    "sandals", 
    "heels", 
    "boots", 
    "sock",
    "socks",
]

export const itemOrganizer = {
    shoes:shoeItems, 
    bottoms:bottomItems,
    tops:topItems,
}

function itemNameContains(item, val){
    return (item.name)&&(item.name.toLowerCase().includes(val))
}

//input: ClothingItem object
//output: (type, rank) where type is in ItemLayerType, rank is int where higher rank = more towards front
export function identifyItem(itemInfo){ 
    t_Tags = [...itemInfo.type_tags]
    t_Tags.push("XXX")
    for (let i=0; i<t_Tags.length; i++){
        t = t_Tags[i].toLowerCase()
        //check shirt
        for (let j=0; j<topItems.length; j++){
            if ((t===topItems[j])||(itemNameContains(itemInfo, topItems[j]))){
                return [ItemLayerType.TOP, j]
            }
        }
        //check pant
        for (let j=0; j<bottomItems.length; j++){
            if ((t===bottomItems[j])||(itemNameContains(itemInfo, bottomItems[j]))){
                return [ItemLayerType.BOTTOM, j]
            }
        }
        //check shoe
        for (let j=0; j<shoeItems.length; j++){
            if ((t===shoeItems[j])||(itemNameContains(itemInfo, shoeItems[j]))){
                return [ItemLayerType.SHOE, j]
            }
        }
    }
    return [ItemLayerType.ACC, 0]
}

export function convertItemsToLayeredComponent(miniItemList, totalWidth, totalHeight, totalItems){ //creates only the rect of one layered item type
    if (miniItemList.length==0){
        return (<View></View>)
    }
    notFirstOpacity = 0.75
    //console.log(miniItemList[0].name)
    return <ImageBackground resizeMode="cover" style={
        {
            width: miniItemList.length*totalWidth/totalItems,
            height: miniItemList.length*totalHeight/totalItems,
            borderWidth: 1,
            borderColor: 'black',
            //borderRadius: 20,
            opacity:(miniItemList.length==totalItems)?1.0:notFirstOpacity,
            justifyContent: 'space-between',
        }
    }
    source={miniItemList[0].img}>
            {convertItemsToLayeredComponent(
                miniItemList.splice(1), 
                totalWidth, 
                totalHeight, 
                totalItems
            )}
    </ImageBackground>
}

function compItemRank(a, b){
    if (a.rank==b.rank){return 0}
    if (a.rank<b.rank){return -1}
    if (a.rank>b.rank){return 1}
}


export async function getCollage(items, setState, updateVar, setNeedUpdate){
    if (!updateVar){
        return
    }
    //console.log(items)
    const errorImage = require("./assets/buttonIcons/icon_cam.png");
    if (items.length==0){
        const returnVal = (<ImageBackground resizeMode="contain" style={
            {
                width: 300,
                height: 300,
                borderWidth: 1,
                borderColor: 'black',
                justifyContent: 'space-between',
            }
        }
        source={errorImage}>
                <Text>No Valid Items Found!</Text>
        </ImageBackground>)
        setNeedUpdate(false)
        setState( returnVal)
    }
    tops = []
    bottoms = []
    shoes = []
    accessories = []
    for (let i=0; i<items.length; i=i+1){
        //console.log(items[i])
        const response = await fetch(base_url+'v1/clothing-items/' + items[i]);
        if (!response.ok) {
            //item not found; most likely item was deleted
            accessories.push({img:errorImage, name:"not found", rank:0 })
        }
        else{
            const itemInfo = await response.json();
            itemType=identifyItem(itemInfo)
            if (itemType[0]===ItemLayerType.BOTTOM){bottoms.push({img:itemInfo.image_link, name:itemInfo.name, rank:itemType[1] })}
            if (itemType[0]===ItemLayerType.TOP){tops.push({img:itemInfo.image_link, name:itemInfo.name,rank:itemType[1] })}
            if (itemType[0]===ItemLayerType.SHOE){shoes.push({img:itemInfo.image_link, name:itemInfo.name,rank:itemType[1] })}
            if (itemType[0]===ItemLayerType.ACC){accessories.push({img:itemInfo.image_link, name:itemInfo.name,rank:itemType[1] })}
        }
    }
    //sort by rank
    tops.sort(compItemRank)
    bottoms.sort(compItemRank)
    shoes.sort(compItemRank)
    accessories.sort(compItemRank)

    //console.log("item types:")
    //console.log(tops)
    //console.log(bottoms)
    //console.log(shoes)
    //console.log(accessories)
    bottomLayerComponent = convertItemsToLayeredComponent(Array.from(tops), 300, 300, tops.length)
    //console.log("item types:")
    //console.log(tops)
    //console.log(bottoms)
    //console.log(shoes)
    //console.log(accessories)
    setNeedUpdate(false)
    //change source={image} to source={{ uri: image_b64}}
    //don't setState as return: updates constantly
    setState (
        <ImageBackground resizeMode="contain" style={
            {
                width: 300,
                height: 300,
                borderWidth: 1,
                borderColor: 'black',
                justifyContent: 'space-between',
            }
        }
        source={errorImage}>
                <ImageBackground resizeMode="contain" style={
                    {
                        width: 100,
                        height: 100,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-end',
                    }
                }
                source={errorImage} >
                </ImageBackground>
        </ImageBackground>
    );
    setState(bottomLayerComponent);
};