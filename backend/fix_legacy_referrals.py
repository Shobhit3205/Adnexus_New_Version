"""
One-time cleanup: purani referral rows jo naye payment-tracking feature se
PEHLE 'completed' mark ho chuki thi, unke paas payment_received=False aur
commission_amount=0 hai (kyunki wo columns tab exist hi nahi karte the).

Ye script un inconsistent rows ko wapas 'pending' status pe reset kar deta
hai, taaki admin naye flow (Mark Payment Received -> Grant Reward) se
unhe sahi tarike se process kar sake aur Earning row bhi ban jaye.

Safe to run multiple times — sirf inconsistent rows ko touch karta hai.
"""

from app.database import engine
from sqlalchemy.orm import Session
from app.models.models import Referral

with Session(engine) as db:
    inconsistent = db.query(Referral).filter(
        Referral.status == "completed",
        Referral.payment_received == False,
    ).all()

    print(f"Found {len(inconsistent)} inconsistent referral(s):")
    for r in inconsistent:
        print(f"  - Referral id={r.id}, referrer_id={r.referrer_id}, referee_id={r.referee_id}")
        r.status = "pending"

    db.commit()
    print(f"✅ Reset {len(inconsistent)} referral(s) back to 'pending'. "
          f"Ab admin panel se dobara 'Mark Payment Received' karo.")