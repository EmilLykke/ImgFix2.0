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

# Her bliver der lavet noget adaptiveThresholding på billedet.
# Det betyder at man kan tage et billede ind som måske har dårlig
# belysning og så kan man gøre teksten i billedet mere klart.
# Til dette bliver der gjort brug af opencv2 som gør det muligt for os
# at arbejde nemt med billeder
_, result = cv2.threshold(img, 20, 255, cv2.THRESH_BINARY)
adaptive = cv2.adaptiveThreshold(
    img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 5)

# Her convetere vi vores billede der er blevet udført adaptiveThresholding på
# til et billede som ikke bare er en byte-array
image = Image.fromarray(adaptive)

# Her laver vi en form for buffer det skal bruges til at
# gøre vores billede større
new_size = tuple(4*x for x in image.size)

# Her gør billedet større
img2 = image.resize(new_size, Image.ANTIALIAS)

# Til sidst læser vi teksten i billedet og printer det.
print(pytesseract.image_to_string(img2))