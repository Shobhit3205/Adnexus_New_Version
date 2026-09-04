"""
Auto-detects columns defined in SQLAlchemy models but missing in the actual
Postgres tables, and adds them with ALTER TABLE. Safe to re-run anytime.
"""

from sqlalchemy import inspect, text
from app.database import engine
from app.models import Campaign, Referral, Earning

# Map: SQLAlchemy type -> Postgres column type (extend if you add more column types later)
TYPE_MAP = {
    "VARCHAR": lambda col: f"VARCHAR({col.type.length})" if col.type.length else "VARCHAR",
    "TEXT": lambda col: "TEXT",
    "STRING": lambda col: f"VARCHAR({col.type.length})" if col.type.length else "VARCHAR",
    "INTEGER": lambda col: "INTEGER",
    "FLOAT": lambda col: "FLOAT",
    "BOOLEAN": lambda col: "BOOLEAN",
    "DATE": lambda col: "DATE",
    "DATETIME": lambda col: "TIMESTAMP",
    "NUMERIC": lambda col: f"NUMERIC({col.type.precision}, {col.type.scale})",
}

def sync_table(model):
    table_name = model.__tablename__
    inspector = inspect(engine)
    existing_columns = {c["name"] for c in inspector.get_columns(table_name)}

    with engine.connect() as conn:
        for col in model.__table__.columns:
            if col.name in existing_columns:
                continue  # already present, skip

            type_name = col.type.__class__.__name__.upper()
            pg_type_fn = TYPE_MAP.get(type_name)
            if not pg_type_fn:
                print(f"⚠️  Skipping {table_name}.{col.name} — unhandled type {type_name}, add it manually")
                continue

            pg_type = pg_type_fn(col)
            default_clause = ""
            if col.default is not None and getattr(col.default, "arg", None) is not None and not callable(col.default.arg):
                default_val = col.default.arg
                if isinstance(default_val, bool):
                    default_clause = f" DEFAULT {str(default_val).upper()}"
                elif isinstance(default_val, (int, float)):
                    default_clause = f" DEFAULT {default_val}"
                elif isinstance(default_val, str):
                    default_clause = f" DEFAULT '{default_val}'"

            sql = f'ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {col.name} {pg_type}{default_clause};'
            print(f"→ Running: {sql}")
            conn.execute(text(sql))

        conn.commit()

if __name__ == "__main__":
    sync_table(Campaign)
    sync_table(Referral)
    sync_table(Earning)
    print("✅ Migration done — sab missing columns sync ho gaye.")