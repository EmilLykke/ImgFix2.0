import sys
import os
import cv2
from PIL import Image
from pytesseract import *

print(os.path.realpath('.'))
exit()
pytesseract.tesseract_cmd = "C:\\Users\\askev\\Source\\Repos\\EmilLykke\\ImgFix2.0\\ImgFix\\ImgFix\\Images\\Tesseract-OCR\\tesseract.exe"


img = cv2.imread ("C:\\Users\\askev\\Source\\Repos\\EmilLykke\\ImgFix2.0\\ImgFix\\ImgFix\\Images\\nyt2.png")
img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# _, result = cv2.threshold(img, 20, 255, cv2.THRESH_BINARY)

adaptive = cv2.adaptiveThreshold(
    img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 5)

# cv2.imshow("result", result)
# cv2.imshow("adaptive", adaptive)
# cv2.waitKey(0)

cv2.imwrite("temporary.jpg", adaptive)
img2 = Image.open("temporary.jpg")
new_size = tuple(4*x for x in img2.size)
img2 = img2.resize(new_size, Image.ANTIALIAS)
print(pytesseract.image_to_string(img2))