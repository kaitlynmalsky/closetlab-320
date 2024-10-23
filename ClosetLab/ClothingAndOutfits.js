//Single Clothing Item.
const TagType = Object.freeze({
    COLOR: "color",
    BRAND: "brand",
    ITEM_TYPE: "type",
    OTHER: "other",
});

export class ClothingItem{
    db_id = ""; //ObjectId in MongoDB of this item
    owner_db_id = ""; //ObjectId in MongoDB of the user this belongs to

    useDonationReminder = true; //specific donation reminder for this item; use with account settings
    
    title = "New Clothing Item"; //user-readable name of this item
    imageInfo = ""; //probably base64

    color_tags = []; //String arrays; initially all empty
    brand_tags = [];
    type_tags = [];
    other_tags = [];

    constructor(image, title, dbId, userId){
        this.title = title;
        this.imageInfo = image;
        this.db_id = dbId;
        this.owner_db_id = userId;
    }

    setImage(stringInfo){
        imageInfo = stringInfo;
    }
    addPropertyToCategory(newStringProperty, category){
        cat_process = category.toLowerCase().trim()
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
        cat_process = category.toLowerCase().trim()
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
