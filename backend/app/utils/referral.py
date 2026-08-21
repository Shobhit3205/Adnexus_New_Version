import secrets
import string
from sqlalchemy.orm import Session
from app.models.models import User


def _random_code(length: int = 8) -> str:
    chars = string.ascii_uppercase + string.digits
    return "ADNX" + "".join(secrets.choice(chars) for _ in range(length))


def generate_unique_referral_code(db: Session) -> str:
    while True:
        code = _random_code()
        exists = db.query(User).filter(User.referral_code == code).first()
        if not exists:
            return code


def get_referrer_by_code(db: Session, ref_code: str) -> User | None:
    if not ref_code:
        return None
    return db.query(User).filter(User.referral_code == ref_code).first()