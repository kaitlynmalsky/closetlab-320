from PIL import Image
from rembg import remove
import base64
import matplotlib.pyplot as plt
import os, io

TOTAL_WIDTH = 100

TOP_WIDTH = 55
TOP_HEIGHT = 55
TOP_START_X = 45

BOTTOM_WIDTH = 55
BOTTOM_HEIGHT = 55

SHOE_WIDTH = 55
SHOE_HEIGHT = 30
SHOE_START_X = 70

ACC_WIDTH = 55
ACC_HEIGHT = 40

ItemLayerType = {
    'TOP': "top",
    'BOTTOM': "bottom",
    'SHOE': "shoe",
    'ACC': "accessory",
}
topItems = [
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
bottomItems = [
    "overalls", 
    "skirt",
    "shorts", 
    "pants", 
    "leggings", 
    "hose"
]
shoeItems = [
    "shoe", 
    "shoes", 
    "flip flops", 
    "flip-flops", 
    "slippers", 
    "sandals", 
    "heels", 
    "boots", 
    "sock",
    "socks"
]
def itemNameContains(item, val):
    return (item['name']) and (val in str(item['name']).lower())

def identifyItem(itemInfo):
    t_Tags = itemInfo['type_tags'].copy()
    t_Tags.append("XXX")
    for i in range(0, len(t_Tags)):
        t = t_Tags[i].lower()
        #check shirt
        for j in range(0, len(topItems)):
            if ((t==topItems[j])or(itemNameContains(itemInfo, topItems[j]))):
                return ['TOP', j]
        #check pant
        for j in range(0, len(bottomItems)):
            if ((t==bottomItems[j])or(itemNameContains(itemInfo, bottomItems[j]))):
                return ['BOTTOM', j]
        #check shoe
        for j in range(0, len(shoeItems)):
            if ((t==shoeItems[j])or(itemNameContains(itemInfo, shoeItems[j]))):
                return ['SHOE', j]
    return ['ACC', 0]


top_image_path = "/Users/weifu/Desktop/Top1.png"
bottom_image_path = "/Users/weifu/Desktop/Bot1.png"

global top_img, bottom_img, top_file_content, bottom_file_content
top_img, bottom_img, top_file_content, bottom_file_content = None, None, None, None
def sortBySecondElement(e):
    return e[1]

def createCollage(imgList: list[object]):
    try:

        itemTracker = {
            'TOP': [],
            'BOTTOM': [],
            'SHOE': [],
            'ACC': [],
        }
        for imgInfo in imgList:
            cutThis = "data:image/png;base64,"
            corrected = imgInfo['image_link']
            if (cutThis in imgInfo['image_link']):
                corrected = imgInfo['image_link'][len(cutThis):] + "============="
            img_content = base64.b64decode(corrected)
            if not img_content:
                print("invalid image link")
                return "error"
            id_ofItem = identifyItem(imgInfo)
            no_bg_img = "testing"#Image.open(io.BytesIO(remove(img_content))).convert('RGBA')
            itemTracker[id_ofItem[0]].append((no_bg_img, id_ofItem[1]))

        itemTracker['TOP'].sort(key=sortBySecondElement)
        itemTracker['BOTTOM'].sort(key=sortBySecondElement)
        itemTracker['SHOE'].sort(key=sortBySecondElement)
        itemTracker['ACC'].sort(key=sortBySecondElement)
        #top_img = Image.open(top_image_path).convert('RGBA')
        #bottom_img = Image.open(bottom_image_path).convert('RGBA')
        #with open(top_image_path, "rb") as f:
        #    top_file_content = f.read()
        #with open(bottom_image_path, "rb") as f:
        #    bottom_file_content = f.read()

        print("Images Loaded Successfully.")
        return itemTracker
        #TODO: 
        #   use itemTracker to add every item to proper place in collage
        #   pant  shirt
        #    pant   shirt
        #     pant    shirt
        #      pant     shirt
        #    acc    shoe
        #      acc    shoe
        #layers from top to bottom: pants, shoes, shirts, acc
        #layers within those groups dictated by order in which they appear in above lists (topItems, etc)
        #ties in rank are broken alphabetically

        try:
            #top_img_no_bg = Image.open(io.BytesIO(remove(top_file_content))).convert('RGBA')
            #bottom_img_no_bg = Image.open(io.BytesIO(remove(bottom_file_content))).convert('RGBA')
            #new_width = max(top_img_no_bg.width, bottom_img_no_bg.width)
            #top_scale = new_width / top_img_no_bg.width
            #bottom_scale = new_width / bottom_img_no_bg.width
            #top_img_resized = top_img_no_bg.resize(
            #    (new_width, int(top_img_no_bg.height * top_scale)), Image.Resampling.LANCZOS)
            #bottom_img_resized = bottom_img_no_bg.resize(
            #    (new_width, int(bottom_img_no_bg.height * bottom_scale)), Image.Resampling.LANCZOS)
            #total_height = top_img_resized.height + bottom_img_resized.height
            #merged_img = Image.new('RGBA', (new_width, total_height), 'WHITE')
            #merged_img.paste(top_img_resized, (0, 0), top_img_resized)
            #merged_img.paste(bottom_img_resized, (0, top_img_resized.height), bottom_img_resized)
            #output_path = 'merged_outfit.jpg'
            #merged_img.convert('RGB').save(output_path, 'JPEG')
            #print("Merged Outfit Image:")
            #plt.figure(figsize=(10, 15))
            #plt.imshow(merged_img)
            #plt.axis('off')
            #plt.show()
            #absolute_path = os.path.abspath(output_path)
            #print(f"The output image has been saved at: {absolute_path}")
            return "output"
        except Exception as e:
            print("An error occurred during processing:", str(e[0:10]))
    except FileNotFoundError as e:
        print(f"File not found: ") #{e}
    except Exception as e:
        print(f"An error occurred while loading images: {e}") 