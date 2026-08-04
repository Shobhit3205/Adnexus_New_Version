import sys
import argparse

from app.database import SessionLocal
from app.models.models import (
    User, Campaign, Platform, PlatformStat, Lead, TargetingRule,
    AdContent, LeadForm, FormSubmission, ClickTracking,
)

TABLES_IN_DELETE_ORDER = [
    ("form_submissions", FormSubmission),
    ("click_tracking",   ClickTracking),
    ("lead_forms",       LeadForm),
    ("ad_contents",      AdContent),
    ("targeting_rules",  TargetingRule),
    ("leads",            Lead),
    ("platform_stats",   PlatformStat),
    ("campaigns",        Campaign),
    ("users",            User),
]


def wipe(confirm: bool):
    db = SessionLocal()
    try:
        print("Current row counts:")
        counts = {}
        for name, model in TABLES_IN_DELETE_ORDER:
            count = db.query(model).count()
            counts[name] = count
            print(f"  - {name}: {count}")
        print()

        total = sum(counts.values())
        if total == 0:
            print("Database is already empty. Nothing to do.")
            return

        if not confirm:
            print("DRY RUN — nothing deleted. Re-run with --confirm to actually wipe everything.")
            return

        for name, model in TABLES_IN_DELETE_ORDER:
            deleted = db.query(model).delete(synchronize_session=False)
            print(f"Deleted {deleted} row(s) from {name}")

        db.commit()
        print("\nDatabase wiped. All tables are now empty (except reference data like platforms).")
        print("You can sign up fresh now.")

    except Exception as e:
        db.rollback()
        print(f"Error — rolled back, nothing was deleted: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--confirm", action="store_true", help="Actually perform the wipe (default is dry run)")
    args = parser.parse_args()
    wipe(confirm=args.confirm)