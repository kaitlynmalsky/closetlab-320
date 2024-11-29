from PIL import Image
from rembg import remove
import matplotlib.pyplot as plt
import os, io

top_image_path = "/Users/weifu/Desktop/Top1.png"
bottom_image_path = "/Users/weifu/Desktop/Bot1.png"

global top_img, bottom_img, top_file_content, bottom_file_content
top_img, bottom_img, top_file_content, bottom_file_content = None, None, None, None

try:
    top_img = Image.open(top_image_path).convert('RGBA')
    bottom_img = Image.open(bottom_image_path).convert('RGBA')

    with open(top_image_path, "rb") as f:
        top_file_content = f.read()
    with open(bottom_image_path, "rb") as f:
        bottom_file_content = f.read()

    print("Top and Bottom Images Loaded Successfully.")

    if top_img and bottom_img and top_file_content and bottom_file_content:
        try:
            top_img_no_bg = Image.open(io.BytesIO(remove(top_file_content))).convert('RGBA')
            bottom_img_no_bg = Image.open(io.BytesIO(remove(bottom_file_content))).convert('RGBA')

            new_width = max(top_img_no_bg.width, bottom_img_no_bg.width)
            top_scale = new_width / top_img_no_bg.width
            bottom_scale = new_width / bottom_img_no_bg.width

            top_img_resized = top_img_no_bg.resize(
                (new_width, int(top_img_no_bg.height * top_scale)), Image.Resampling.LANCZOS)
            bottom_img_resized = bottom_img_no_bg.resize(
                (new_width, int(bottom_img_no_bg.height * bottom_scale)), Image.Resampling.LANCZOS)

            total_height = top_img_resized.height + bottom_img_resized.height
            merged_img = Image.new('RGBA', (new_width, total_height), 'WHITE')

            merged_img.paste(top_img_resized, (0, 0), top_img_resized)
            merged_img.paste(bottom_img_resized, (0, top_img_resized.height), bottom_img_resized)

            output_path = 'merged_outfit.jpg'
            merged_img.convert('RGB').save(output_path, 'JPEG')

            print("Merged Outfit Image:")
            plt.figure(figsize=(10, 15))
            plt.imshow(merged_img)
            plt.axis('off')
            plt.show()

            absolute_path = os.path.abspath(output_path)
            print(f"The output image has been saved at: {absolute_path}")
        except Exception as e:
            print("An error occurred during processing:", str(e))
    else:
        print("Images were not correctly loaded. Please check the file paths and try again.")
except FileNotFoundError as e:
    print(f"File not found: {e}")
except Exception as e:
    print(f"An error occurred while loading images: {e}")