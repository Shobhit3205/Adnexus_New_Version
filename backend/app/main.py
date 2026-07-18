from dotenv import load_dotenv
load_dotenv()  # This loads .env into os.environ
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import models
<<<<<<< HEAD
from app.routes import campaigns, leads, analytics, ad_content, public_forms, auth, admin
from app.routes import oauth
=======
from app.routes import campaigns, leads, analytics, ad_content, public_forms, auth, admin, audience_targeting
>>>>>>> e3f86026ae8711508b2b140f8ee46eadee4fcfcb



# Database mein saari tables banao
models.Base.metadata.create_all(bind=engine)

# FastAPI app banao
app = FastAPI(
    title="AdNexus API",
    description="AdNexus Dashboard Backend API",
    version="1.0.0"
)


# CORS — React frontend se connect hone ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes register karo
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(ad_content.router, prefix="/api/campaigns", tags=["Ad Content"])
app.include_router(
    public_forms.router,
    prefix="/public",
    tags=["Public Forms"]
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Auth"]
)

app.include_router(
    admin.router,
    prefix="/api",
    tags=["Admin"]
)

<<<<<<< HEAD
app.include_router(oauth.router, prefix="/api/oauth")
=======
app.include_router(audience_targeting.router)

>>>>>>> e3f86026ae8711508b2b140f8ee46eadee4fcfcb
# Test route
@app.get("/")
def root():
    return {"message": "AdNexus API is running! 🚀"}

