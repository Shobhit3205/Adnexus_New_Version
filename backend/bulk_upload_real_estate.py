"""
Bulk upload Real Estate & Construction templates to Cloudinary, into:
    adnexus/templates/real-estate-construction/

Usage:
    1. Make sure ./templates_real_estate/ has your images (PNG or JPG/JPEG)
    2. Make sure your .env has CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
    3. python bulk_upload_real_estate.py

Run this from the backend folder (same place as bulk_upload_templates.py).
"""
import os
import glob
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

FOLDER = "adnexus/templates/real-estate-construction"
LOCAL_DIR = "templates_real_estate"

def upload_all():
    exts = ("*.png", "*.jpg", "*.jpeg")
    files = []
    for ext in exts:
        files.extend(glob.glob(os.path.join(LOCAL_DIR, ext)))
    seen = set()
    unique_files = []
    for f in files:
        key = f.lower()
        if key not in seen:
            seen.add(key)
            unique_files.append(f)
    files = sorted(unique_files)

    if not files:
        print(f"No image files found in ./{LOCAL_DIR}/ — check the folder.")
        return

    results = []
    for path in files:
        filename = os.path.basename(path)
        public_id = os.path.splitext(filename)[0]
        print(f"Uploading {filename} ...")
        result = cloudinary.uploader.upload(
            path,
            folder=FOLDER,
            public_id=public_id,
            resource_type="image",
            overwrite=True,
        )
        print(f"  -> {result['secure_url']}")
        results.append((filename, result["secure_url"]))

    print(f"\nDone. Uploaded {len(results)} files.")
    return results

if __name__ == "__main__":
    upload_all()