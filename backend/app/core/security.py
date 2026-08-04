from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models.models import User
import os

from app.database import get_db
from app.models.models import User

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 1 din valid rahega token

# Token frontend se kaise aayega, ye batata hai (Authorization: Bearer <token>)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token, please login again",
        )


# Ye function har protected route mein use hoga current logged-in user nikalne ke liye
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# Read admin email from .env (add this line to your .env file):
#   ADMIN_EMAIL=youremail@gmail.com
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")


# Ye function sirf admin routes mein use hoga — normal users ko 403 milega
def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Reuses your existing get_current_user (which already verifies the
    JWT signature and loads the user from DB). On top of that, it checks
    the logged-in user's email against ADMIN_EMAIL from .env.

    Because this runs on the SERVER for every request, a normal user
    cannot bypass this by editing anything in the browser/frontend —
    their token's signature would fail, or their email simply won't match.
    """
    if not ADMIN_EMAIL:
        # Fails safe: if you forgot to set ADMIN_EMAIL in .env,
        # nobody gets treated as admin (instead of everyone).
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_EMAIL not configured on server",
        )

    if current_user.email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user