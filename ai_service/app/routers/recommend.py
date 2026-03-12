import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from fastapi import APIRouter
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # Add app directory
from services.recommend_service import (
    get_trending_products,
    get_personal_recommendations,
    get_frequently_bought_together
)

router = APIRouter()

@router.get("/recommend/{user_id}")
def recommend(user_id: str):
    trending = get_trending_products()
    personalized = get_personal_recommendations(user_id)
    fbt = get_frequently_bought_together(user_id)

    return {
        "user_id": user_id,
        "trending": trending,
        "personalized": personalized,
        "frequently_bought_together": fbt
    }
