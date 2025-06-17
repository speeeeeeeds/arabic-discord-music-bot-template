from PIL import Image, ImageDraw, ImageFont
import requests, sys, os
from io import BytesIO

def generate_image(song_name, image_url):
    os.makedirs("images", exist_ok=True)
    tpl = Image.open("python/template.png").convert("RGBA")
    resp = requests.get(image_url, timeout=10)
    cover = Image.open(BytesIO(resp.content)).convert("RGBA").resize((800, 450))
    tpl.paste(cover, (260, 150))
    draw = ImageDraw.Draw(tpl)
    font = ImageFont.truetype("arial.ttf", 50)
    text = song_name if len(song_name) <= 30 else song_name[:27]+"..."
    w, h = draw.textsize(text, font=font)
    x = (tpl.width - w) // 2
    draw.text((x, 100), text, font=font, fill="white")
    output = f"images/{text.replace(' ','_')}.png"
    tpl.save(output)
    print(output)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_image.py <song_name> <image_url>")
        sys.exit(1)
    generate_image(sys.argv[1], sys.argv[2])
