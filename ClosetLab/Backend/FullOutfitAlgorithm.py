from PIL import Image
from rembg import remove
import base64
import io
from io import BytesIO
import requests

print("in fulloutfitalgorithm")

TOTAL_WIDTH = 250
TOTAL_HEIGHT = 250
OVERLAP_SPAN = 200

TOP_WIDTH = int(TOTAL_WIDTH/1.81)
TOP_HEIGHT = int(TOTAL_HEIGHT/1.81)
TOP_START_X = int(TOTAL_HEIGHT/2.22)
TOP_START_Y = 0

BOTTOM_WIDTH = int(TOTAL_WIDTH/1.81)
BOTTOM_HEIGHT = int(TOTAL_HEIGHT/1.81)
BOTTOM_START_X = 0
BOTTOM_START_Y = 0

SHOE_WIDTH = int(TOTAL_WIDTH/1.81)
SHOE_HEIGHT = int(TOTAL_HEIGHT/3.33)
SHOE_START_X = int(TOTAL_WIDTH/2.5)
SHOE_START_Y= int(TOTAL_HEIGHT/2)

ACC_WIDTH = int(TOTAL_WIDTH/1.81)
ACC_HEIGHT = int(TOTAL_HEIGHT/3.33)
ACC_START_X = 0
ACC_START_Y = int(TOTAL_HEIGHT/3.33)

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

def get_base64_from_url(url):
    """Fetches an image from a URL and returns its base64 encoding."""

    response = requests.get(url)
    if response.status_code == 200:
        return base64.b64encode(response.content).decode('utf-8')
    else:
        return None

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

def sortBySecondElement(e):
    return e[1]

def mergeImgTable(tbl, mergeImg, START_X, START_Y, WIDTH, HEIGHT):
    i=0
    for shirtTup in tbl:
        numShirts = len(tbl)
        #TOP_WIDTH = 55
        #TOP_HEIGHT = 55
        #TOP_START_X = 45
        #print("new item"  + str(i))
        scaleFactor = (1/numShirts)
        imgScaleFactor = scaleFactor
        if scaleFactor!=1:
            imgScaleFactor=2*scaleFactor
        resized = shirtTup[0].resize((int(WIDTH*imgScaleFactor), int(HEIGHT*imgScaleFactor)), Image.Resampling.LANCZOS)
        xDelta = (OVERLAP_SPAN*scaleFactor)
        #xDelta=150
        yDelta = (OVERLAP_SPAN*scaleFactor)
        #yDelta=150
        mergeImg.alpha_composite(resized, (int(START_X+xDelta*i), int(START_Y+yDelta*i)))

        i+=1

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
            
            print(corrected)
            img_content = ""
            no_bg_img = None
            #urllib.request.urlretrieve( 
            #        'https://media.geeksforgeeks.org/wp-content/uploads/20210318103632/gfg-300x300.png', 
            #        "placeholder.png") 
            #    img_content = Image.open("placeholder.png")
            if ("https://" in imgInfo['image_link']):
                img_content = base64.b64decode(get_base64_from_url(imgInfo['image_link']))
                #Image.open(requests.get(imgInfo['image_link'], stream=True).raw)
            else:
                img_content = base64.b64decode(corrected)
            if not img_content:
                print("invalid image link")
                return "error"
            id_ofItem = identifyItem(imgInfo)
            no_bg_img = Image.open(io.BytesIO(remove(img_content))).convert('RGBA')
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

        #print("Images Loaded Successfully.")
        
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

        #currently itemTracker['BOTTOM'] = list[ tup(Image, rank:int) ]

        merged_img = Image.new('RGBA', (TOTAL_WIDTH, TOTAL_HEIGHT), 'WHITE')
        hasTop = len(itemTracker['TOP'])>0
        hasBot = len(itemTracker['BOTTOM'])>0
        hasShoe = len(itemTracker['SHOE'])>0
        hasAcc = len(itemTracker['ACC'])>0
        #handle all
        if hasTop and hasBot and hasShoe and hasAcc:
            mergeImgTable(itemTracker['TOP'], merged_img, TOP_START_X, TOP_START_Y, TOP_WIDTH, TOP_HEIGHT)
            mergeImgTable(itemTracker['BOTTOM'], merged_img, BOTTOM_START_X, BOTTOM_START_Y, BOTTOM_WIDTH, BOTTOM_HEIGHT)
            mergeImgTable(itemTracker['SHOE'], merged_img, SHOE_START_X, SHOE_START_Y, SHOE_WIDTH, SHOE_HEIGHT)
            mergeImgTable(itemTracker['ACC'], merged_img, ACC_START_X, ACC_START_Y, ACC_WIDTH, ACC_HEIGHT)
        #handle top + 1/2 bottom
        elif hasTop and hasBot and hasShoe:
            mergeImgTable(itemTracker['TOP'], merged_img, TOP_START_X, TOP_START_Y, TOP_WIDTH, TOP_HEIGHT)
            mergeImgTable(itemTracker['BOTTOM'], merged_img, BOTTOM_START_X, BOTTOM_START_Y, BOTTOM_WIDTH, BOTTOM_HEIGHT)
            mergeImgTable(itemTracker['SHOE'], merged_img, 0, SHOE_START_Y, TOTAL_WIDTH, SHOE_HEIGHT)
        elif hasTop and hasBot and hasAcc:
            mergeImgTable(itemTracker['TOP'], merged_img, TOP_START_X, TOP_START_Y, TOP_WIDTH, TOP_HEIGHT)
            mergeImgTable(itemTracker['BOTTOM'], merged_img, BOTTOM_START_X, BOTTOM_START_Y, BOTTOM_WIDTH, BOTTOM_HEIGHT)
            mergeImgTable(itemTracker['ACC'], merged_img, 0, SHOE_START_Y, TOTAL_WIDTH, ACC_HEIGHT)
        #handle bottom + 1/2 bottom
        elif hasTop and hasShoe and hasAcc:
            mergeImgTable(itemTracker['TOP'], merged_img, 0, TOP_START_Y, TOTAL_WIDTH, TOP_HEIGHT)
            mergeImgTable(itemTracker['BOTTOM'], merged_img, BOTTOM_START_X, BOTTOM_START_Y, BOTTOM_WIDTH, BOTTOM_HEIGHT)
            mergeImgTable(itemTracker['SHOE'], merged_img, SHOE_START_X, SHOE_START_Y, TOTAL_WIDTH, TOTAL_HEIGHT)
        elif hasBot and hasShoe and hasAcc:
            mergeImgTable(itemTracker['BOTTOM'], merged_img, 0, BOTTOM_START_Y, TOTAL_WIDTH, BOTTOM_HEIGHT)
            mergeImgTable(itemTracker['SHOE'], merged_img, SHOE_START_X, SHOE_START_Y, SHOE_WIDTH, SHOE_HEIGHT)
            mergeImgTable(itemTracker['ACC'], merged_img, ACC_START_X, ACC_START_Y, ACC_WIDTH, ACC_HEIGHT)
        # handle only one category
        elif hasTop and (not hasBot) and (not hasAcc) and (not hasShoe):
            mergeImgTable(itemTracker['TOP'], merged_img, 0, 0, TOTAL_WIDTH, TOTAL_HEIGHT)
        elif (not hasTop) and ( hasBot) and (not hasAcc) and (not hasShoe):
            mergeImgTable(itemTracker['BOTTOM'], merged_img, 0, 0, TOTAL_WIDTH, TOTAL_HEIGHT)
        elif (not hasTop) and (not hasBot) and (not hasAcc) and (hasShoe):
            mergeImgTable(itemTracker['SHOE'], merged_img, 0, 0, TOTAL_WIDTH, TOTAL_HEIGHT)
        elif (not hasTop) and (not hasBot) and (hasAcc) and (not hasShoe):
            mergeImgTable(itemTracker['ACC'], merged_img, 0, 0, TOTAL_WIDTH, TOTAL_HEIGHT)
        
        buffered = BytesIO()
        print(f"merged_img.size is {merged_img.size} before compression")
        merged_img.save(buffered, format="PNG", quality=20, optimize=True)
        print(f"merged_img.size is {merged_img.size} after compression")
        img_str = base64.b64encode(buffered.getvalue())
        #print("sent img")
        return 'data:image/png;base64,'+str(img_str)[2:-1]

    except FileNotFoundError as e:
        print(f"File not found: ") #{e}
    except Exception as e:
        print(f"An error occurred while loading images: {e}") 