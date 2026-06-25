from fastapi import APIRouter

router = APIRouter(tags=["campaigns"])


@router.get("/")
def get_analytics():
    return {"message": "Analytics route working!"}