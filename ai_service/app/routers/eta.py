import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from fastapi import APIRouter
import joblib
import numpy as np
from geopy.distance import geodesic
from db.mongo import get_connection

router = APIRouter()

# Load model with absolute path
model_path = os.path.join(os.path.dirname(__file__), '../ml/eta_model.pkl')
model = joblib.load(model_path)

@router.post("/predict-eta")
def predict_eta(data: dict):
    products_collection = get_connection()
    client = products_collection.database.client
    db = client["zepto"]

    warehouse_id = data.get("warehouse_id")
    user_location = data.get("user_location") or {}
    items = data.get("items") or []

    if not warehouse_id:
        return {"eta_minutes": 10, "distance_km": 0.0, "warehouse_load": 5}

    # Support both schemas: {_id: "w1"} and {warehouse_id: "w1"}
    warehouse = db.warehouses.find_one({"_id": warehouse_id}) or db.warehouses.find_one({"warehouse_id": warehouse_id})

    if not warehouse:
        return {"eta_minutes": 10, "distance_km": 0.0, "warehouse_load": 5}

    # Some warehouse docs use active_riders (AI dataset), while others don't (backend seed).
    warehouse_load = int(warehouse.get("active_riders", 5) or 5)

    # calculate order size safely
    order_size = sum(int(item.get("qty", 0) or 0) for item in items)
    if order_size <= 0:
        order_size = 1

    wh_location = warehouse.get("location") or {}
    wh_lat = float(wh_location.get("lat", 12.9716))
    wh_lng = float(wh_location.get("lng", 77.5946))
    user_lat = float(user_location.get("lat", 12.9716))
    user_lng = float(user_location.get("lng", 77.5946))

    # calculate distance
    distance_km = geodesic((wh_lat, wh_lng), (user_lat, user_lng)).km

    try:
        X = np.array([[warehouse_load, order_size, distance_km]])
        eta = model.predict(X)[0]
        eta_minutes = max(5, round(float(eta)))
    except Exception:
        # Keep endpoint stable even if model runtime fails.
        eta_minutes = max(8, round(warehouse_load * 0.3 + order_size * 1.8 + distance_km * 1.4))

    return {
        "eta_minutes": eta_minutes,
        "distance_km": round(distance_km, 2),
        "warehouse_load": warehouse_load,
    }
