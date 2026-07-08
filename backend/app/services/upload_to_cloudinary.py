import cloudinary
import cloudinary.uploader
import os
import json
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

BASE_PATH = r"C:\Users\HP\Downloads\TEMPLATE\FINANCIAL SERVICES"
CLOUDINARY_FOLDER = "adnexus/templates/financial-services"

uploaded_urls = {}

for filename in os.listdir(BASE_PATH):
    if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        continue

    filepath = os.path.join(BASE_PATH, filename)
    public_id = filename.rsplit('.', 1)[0]

    try:
        result = cloudinary.uploader.upload(
            filepath,
            folder=CLOUDINARY_FOLDER,
            public_id=public_id,
            overwrite=True,
            resource_type="image",
        )
        url = result["secure_url"]
        uploaded_urls[public_id] = url
        print(f"✅ {filename} → {url}")
    except Exception as e:
        print(f"❌ {filename} failed: {e}")

with open("uploaded_urls.json", "w") as f:
    json.dump(uploaded_urls, f, indent=2)

print("\n✅ Done!")
print(json.dumps(uploaded_urls, indent=2))