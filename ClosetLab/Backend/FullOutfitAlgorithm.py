from PIL import Image
from rembg import remove
import base64
import io
from io import BytesIO
import requests

print("in fulloutfitalgorithm")

# Constants
TOTAL_WIDTH = 250
TOTAL_HEIGHT = 250
OVERLAP_SPAN = 50  # Reduced for better placement

# Position and size configurations
config = {
    'TOP': {
        'width': int(TOTAL_WIDTH / 1.81),
        'height': int(TOTAL_HEIGHT / 1.81),
        'start_x': int(TOTAL_HEIGHT / 2.22),
        'start_y': 0
    },
    'BOTTOM': {
        'width': int(TOTAL_WIDTH / 1.81),
        'height': int(TOTAL_HEIGHT / 1.81),
        'start_x': 0,
        'start_y': 0
    },
    'SHOE': {
        'width': int(TOTAL_WIDTH / 1.81),
        'height': int(TOTAL_HEIGHT / 3.33),
        'start_x': int(TOTAL_WIDTH / 2.5),
        'start_y': int(TOTAL_HEIGHT / 2)
    },
    'ACC': {
        'width': int(TOTAL_WIDTH / 1.81),
        'height': int(TOTAL_HEIGHT / 3.33),
        'start_x': 0,
        'start_y': int(TOTAL_HEIGHT / 3.33)
    }
}

# Item categories
ItemLayerType = {
    'TOP': "top",
    'BOTTOM': "bottom",
    'SHOE': "shoe",
    'ACC': "accessory",
}

# Item lists
topItems = [
    "coat", "hoodie", "sweatshirt", "cardigan", "jacket", "fleece",
    "sweater", "shirt", "blouse", "polo", "tank top", "undershirt"
]
bottomItems = [
    "overalls", "skirt", "shorts", "pants", "leggings", "hose"
]
shoeItems = [
    "shoe", "shoes", "flip flops", "flip-flops", "slippers",
    "sandals", "heels", "boots", "sock", "socks"
]

def itemNameContains(item, val):
    return (item['name']) and (val in str(item['name']).lower())

def get_base64_from_url(url):
    """Fetches an image from a URL and returns its base64 encoding."""
    response = requests.get(url)
    if response.status_code == 200:
        return base64.b64encode(response.content).decode('utf-8')
    else:
        print(f"Failed to fetch image from URL: {url} with status code {response.status_code}")
        return None

def identifyItem(itemInfo):
    t_Tags = itemInfo.get('type_tags', []).copy()
    t_Tags.append("XXX")
    for t in t_Tags:
        t = t.lower()
        for category, items in [('TOP', topItems), ('BOTTOM', bottomItems), ('SHOE', shoeItems)]:
            for j, val in enumerate(items):
                if (t == val) or itemNameContains(itemInfo, val):
                    return [category, j]
    return ['ACC', 0]

def sortBySecondElement(e):
    return e[1]

def mergeImgTable(tbl, mergeImg, START_X, START_Y, WIDTH, HEIGHT):
    i = 0
    numItems = len(tbl)
    scaleFactor = (1 / numItems) if numItems > 0 else 1
    imgScaleFactor = scaleFactor * 2 if scaleFactor != 1 else 1

    for item, rank in tbl:
        resized = item.resize(
            (int(WIDTH * imgScaleFactor), int(HEIGHT * imgScaleFactor)),
            Image.Resampling.LANCZOS
        )

        xDelta = int(OVERLAP_SPAN * scaleFactor)
        yDelta = int(OVERLAP_SPAN * scaleFactor)

        position = (int(START_X + xDelta * i), int(START_Y + yDelta * i))
        print(f"Pasting image at position: {position} with size: {resized.size}")

        # Paste with mask to handle transparency
        mergeImg.paste(resized, position, resized)

        i += 1

def createCollage(imgList: list):
    try:
        print(f"Input images: {imgList}")

        itemTracker = {
            'TOP': [],
            'BOTTOM': [],
            'SHOE': [],
            'ACC': [],
        }

        for imgInfo in imgList:
            image_link = imgInfo.get('image_link', '')
            name = imgInfo.get('name', 'unnamed')

            if image_link.startswith("data:image/png;base64,"):
                corrected = image_link[len("data:image/png;base64,"):]
                # It seems adding "=============" is unintentional and corrupts the base64 data
            else:
                corrected = image_link

            print(f"Processing image '{name}' with link: {corrected[:30]}...")

            img_content = b""
            if corrected.startswith("https://"):
                img_base64 = get_base64_from_url(corrected)
                if img_base64:
                    img_content = base64.b64decode(img_base64)
                else:
                    print(f"Failed to fetch image for '{name}'")
                    continue
            else:
                try:
                    img_content = base64.b64decode(corrected)
                except base64.binascii.Error as e:
                    print(f"Base64 decoding error for image '{name}': {e}")
                    continue

            if not img_content:
                print(f"Invalid image link for '{name}'")
                continue

            print(f"Base64 data length for '{name}': {len(img_content)}")

            id_ofItem = identifyItem(imgInfo)
            print(f"Identified '{name}' as {id_ofItem[0]} with rank {id_ofItem[1]}")

            try:
                no_bg_img = Image.open(io.BytesIO(remove(img_content))).convert('RGBA')
                print(f"Processed image '{name}' size: {no_bg_img.size}, mode: {no_bg_img.mode}")
                # no_bg_img.save(f"save_{name}.png")
            except Exception as e:
                print(f"Error processing image '{name}': {e}")
                continue

            itemTracker[id_ofItem[0]].append((no_bg_img, id_ofItem[1]))

        # Sort items within each category
        for category in itemTracker:
            itemTracker[category].sort(key=sortBySecondElement)
            print(f"Sorted {category} items by rank: {[tup[1] for tup in itemTracker[category]]}")

        # Initialize merged image with white background
        merged_img = Image.new('RGBA', (TOTAL_WIDTH, TOTAL_HEIGHT), (255, 255, 255, 255))
        print(f"Merged image initialized with size {merged_img.size} and mode {merged_img.mode}")

        # Determine which categories are present
        hasTop = len(itemTracker['TOP']) > 0
        hasBot = len(itemTracker['BOTTOM']) > 0
        hasShoe = len(itemTracker['SHOE']) > 0
        hasAcc = len(itemTracker['ACC']) > 0

        # Merge images based on available categories
        if hasTop:
            cfg = config['TOP']
            print("Merging TOP items")
            mergeImgTable(itemTracker['TOP'], merged_img, cfg['start_x'], cfg['start_y'], cfg['width'], cfg['height'])

        if hasBot:
            cfg = config['BOTTOM']
            print("Merging BOTTOM items")
            mergeImgTable(itemTracker['BOTTOM'], merged_img, cfg['start_x'], cfg['start_y'], cfg['width'], cfg['height'])

        if hasShoe:
            cfg = config['SHOE']
            print("Merging SHOE items")
            mergeImgTable(itemTracker['SHOE'], merged_img, cfg['start_x'], cfg['start_y'], cfg['width'], cfg['height'])

        if hasAcc:
            cfg = config['ACC']
            print("Merging ACC items")
            mergeImgTable(itemTracker['ACC'], merged_img, cfg['start_x'], cfg['start_y'], cfg['width'], cfg['height'])

        # Save merged image for debugging
        # merged_img.save("debug_imagetest.png")
        # print("Merged image saved as debug_imagetest.png")

        # Prepare the final output
        buffered = BytesIO()
        print(f"Merged image size before compression: {merged_img.size}")
        merged_img.save(buffered, format="PNG", optimize=True, compress_level=9)
        print(f"Merged image size after compression: {len(buffered.getvalue())} bytes")

        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        print("Collage creation successful")
        return f'data:image/png;base64,{img_str}'

    except FileNotFoundError as e:
        print(f"File not found: {e}")
    except Exception as e:
        print(f"An error occurred while loading images: {e}")
