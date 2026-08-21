from app.database import SessionLocal
from app.models.models import User
from app.utils.referral import generate_unique_referral_code

db = SessionLocal()
users_without_code = db.query(User).filter(User.referral_code.is_(None)).all()

for user in users_without_code:
    user.referral_code = generate_unique_referral_code(db)

db.commit()
print(f"{len(users_without_code)} users ko referral code assign ho gaya.")
db.close()