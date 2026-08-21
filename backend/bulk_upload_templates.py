"""
Bulk upload Financial Services ad templates to Cloudinary, into:
    adnexus/templates/financial-services/

Usage:
    1. Make sure ./templates/ has your images (PNG or JPG/JPEG both work now)
    2. Make sure your .env has CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
    3. pip install cloudinary python-dotenv --break-system-packages
    4. python bulk_upload_templates.py

The public_id is derived from the filename (without extension) so the
final Cloudinary URL exactly matches the naming pattern already used in
your PREBUILT_TEMPLATES array, e.g.:
    business-loan (3).png  -> .../financial-services/business-loan (3).png
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

FOLDER = "adnexus/templates/financial-services"
LOCAL_DIR = "templates"  # folder with your images

def upload_all():
    exts = ("*.png", "*.jpg", "*.jpeg")
    files = []
    for ext in exts:
        files.extend(glob.glob(os.path.join(LOCAL_DIR, ext)))
    # de-duplicate: Windows filesystem is case-insensitive, so on Windows
    # "*.jpg" alone can match "Photo.JPG" too — no need for separate
    # uppercase patterns, and if paths ever repeat, dedupe by lowercase.
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
        public_id = os.path.splitext(filename)[0]  # e.g. "business-loan (3)"
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