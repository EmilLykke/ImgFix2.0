# Her impotere vi de forskellige ting som vi skal bruge for at 
# kunne scanne vores billeder for tekst
import io
import sys
import os
import cv2
from PIL import Image
from pytesseract import *
import base64
import numpy as np

# Her angiver vi stien til vores tesseract program
pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Her sætter vi variablen base64string_path lig med det input som 
# sendes med fra C# koden.
base64string_path = sys.argv[1]

# Her definere vi en variabel som skal holde på vores base64 string
img_data = ""

# Her åbner vi filen med base64 stringen i, ud fra den path som blev sendt med
# Der er kun en linje i denne fil så vi sætter den første linje lig med vores
# img_data variabel 
with open(base64string_path) as f:
    lines = f.readlines()
    img_data = lines[0]

# Her definere vi en metode som tager et base64 representation
# af et billede ind og retunere det som et PIL image som skal 
# bruges i forbindelse med scanning af teksten.
def stringToImage(base64_string):
    imgdata = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(imgdata))

# Her definere vi en metode som convetere vores PIL image til et RGB image
# Som vi kan gøre større. 
def toRGB(image):
    return cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)

# Her kalder vi metoderne stringToImage og toRGB.
img = toRGB(stringToImage(img_data))

# Her convetere vi vores billede til et gråligt billede
img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

# Her convetere vi vores byte-array til et billede 
image = Image.fromarray(img)

# Her laver vi en form for buffer det skal bruges til at
# gøre vores billede større
new_size = tuple(4*x for x in image.size)

# Her gør vi billedet større
img2 = image.resize(new_size, Image.ANTIALIAS)

# Til sidst læser vi teksten i billedet og printer det.
print(pytesseract.image_to_string(img2))