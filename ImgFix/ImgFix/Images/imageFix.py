import io
import sys
import os
import cv2
from PIL import Image
from pytesseract import *
import base64
import numpy as np

pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"






img_data = sys.argv[1]
# Take in base64 string and return PIL image
def stringToImage(base64_string):
    imgdata = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(imgdata))

# convert PIL Image to an RGB image( technically a numpy array ) that's compatible with opencv
def toRGB(image):
    return cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)

img = toRGB(stringToImage(img_data))

img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)



# _, result = cv2.threshold(img, 20, 255, cv2.THRESH_BINARY)
adaptive = cv2.adaptiveThreshold(
    img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 5)

# cv2.imshow("result", result)
# cv2.imshow("adaptive", adaptive)
# cv2.waitKey(0)

cv2.imwrite(r"C:\PROJEKTER\C#\ImgFix2.0\ImgFix\ImgFix\Images\temporary.jpg", adaptive)
# cv2.imwrite(r"C:\PROJEKTER\C#\ImgFix2.0\ImgFix\ImgFix\Images\temporary.jpg", img)
img2 = Image.open(r"C:\PROJEKTER\C#\ImgFix2.0\ImgFix\ImgFix\Images\temporary.jpg")
# cv2.imwrite(r"C:\Users\askev\Source\Repos\EmilLykke\ImgFix2.0\ImgFix\ImgFix\Images\temporary.jpg", adaptive)
# img2 = Image.open(r"C:\Users\askev\Source\Repos\EmilLykke\ImgFix2.0\ImgFix\ImgFix\Images\temporary.jpg")
new_size = tuple(4*x for x in img2.size)
img2 = img2.resize(new_size, Image.ANTIALIAS)
print(pytesseract.image_to_string(img2))