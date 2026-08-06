"""
One-time fix script: adds missing columns to the `campaigns` table
that exist in the SQLAlchemy model but were never migrated into the
actual Postgres database.

Usage (run from inside the backend folder, with venv activated):
    python fix_columns.py
"""

from sqlalchemy import text
from app.database import engine

# Add any columns here that exist in models.py but might be missing in the DB
COLUMNS_TO_ENSURE = [
    ("meta_campaign_id", "VARCHAR"),
    ("meta_adset_id", "VARCHAR"),
    ("meta_ad_id", "VARCHAR"),
    ("website_url", "VARCHAR"),
]

def run():
    with engine.connect() as conn:
        for col_name, col_type in COLUMNS_TO_ENSURE:
            stmt = text(
                f"ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS {col_name} {col_type};"
            )
            conn.execute(stmt)
            print(f"OK: ensured column '{col_name}' ({col_type}) exists on campaigns")
        conn.commit()
    print("\nDone. All required columns are now present.")

if __name__ == "__main__":
    run()