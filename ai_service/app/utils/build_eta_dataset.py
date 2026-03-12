import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

import pandas as pd
from geopy.distance import geodesic
from db.mongo import get_connection

def build_eta_training_data():
    products_collection = get_connection()
    client = products_collection.database.client
    db = client["zepto"]
    warehouses = {w["_id"]: w for w in db.warehouses.find({})}
    orders = list(db.orders.find({}))

    rows = []

    for o in orders:
        warehouse = warehouses[o["warehouse_id"]]
        user_location = o.get("user_location")  # you can add this

        # distance (dummy for now)
        distance_km = geodesic(
            (warehouse["location"]["lat"], warehouse["location"]["lng"]),
            (12.9716, 77.5946)   # fallback Bangalore center
        ).km

        order_size = sum(item["qty"] for item in o["items"])

        rows.append({
            "warehouse_load": warehouse["active_riders"],
            "order_size": order_size,
            "distance_km": distance_km,
            "delivery_time_minutes": o["delivery_time_minutes"]
        })

    df = pd.DataFrame(rows)
    csv_path = os.path.join(os.path.dirname(__file__), '../../eta_training_data.csv')
    df.to_csv(csv_path, index=False)
    print(df.head())

if __name__ == "__main__":
    build_eta_training_data()

