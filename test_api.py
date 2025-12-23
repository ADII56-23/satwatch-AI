import numpy as np

import requests
import time
import os

# Create dummy images
def create_image(filename):
    # random noise image 256x256x3
    img = np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8)
    # Save as png (using opencv if available, else manual? We don't have CV2 in env?)
    # Wait, we might not have cv2. Let's use rasterio or just raw bytes if needed. 
    # Actually, the user environment had install issues. 
    # Let's try to just write a simple PPM or BMP struct, OR use standard library if possible?
    # No, we have rasterio.
    import rasterio
    from rasterio.transform import from_origin
    
    transform = from_origin(0, 0, 1, 1)
    with rasterio.open(filename, 'w', driver='GTiff', 
                       height=256, width=256, count=3, dtype='uint8',
                       transform=transform) as dst:
        dst.write(np.transpose(img, (2, 0, 1)))

create_image("dummy_before.tif")
create_image("dummy_after.tif")

# Send request
url = "http://127.0.0.1:8000/analyze"
files = {
    'before_image': open('dummy_before.tif', 'rb'),
    'after_image': open('dummy_after.tif', 'rb')
}

try:
    print("Sending request...")
    r = requests.post(url, files=files)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Failed: {e}")
