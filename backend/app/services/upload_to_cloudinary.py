import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_base64_to_cloudinary(base64_data_uri: str) -> str:
    """
    Agar image base64 data-URI hai (user-uploaded), Cloudinary pe upload
    karke real https URL return karta hai. Google/Meta ko sirf real URL
    chahiye, base64 nahi.
    """
    result = cloudinary.uploader.upload(
        base64_data_uri,
        folder="adnexus/user-uploads",
        resource_type="image",
    )
    return result["secure_url"]