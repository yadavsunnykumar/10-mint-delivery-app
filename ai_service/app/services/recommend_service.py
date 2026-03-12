import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from db.mongo import get_connection
from collections import defaultdict


def _serialize_products(products):
    serialized = []
    for product in products:
        if "_id" in product:
            product["_id"] = str(product["_id"])
        serialized.append(product)
    return serialized

# Get MongoDB connection and databases
def _get_db_and_collections():
    products_collection = get_connection()
    client = products_collection.database.client
    db = client["zepto"]
    return db, products_collection

# --------------------------------------
# TRENDING PRODUCTS
# --------------------------------------
def get_trending_products():
    db, products_collection = _get_db_and_collections()
    return _serialize_products(list(products_collection.find().sort("sales", -1).limit(10)))


# --------------------------------------
# PERSONAL RECOMMENDATIONS (based on user's past orders)
# --------------------------------------
def get_personal_recommendations(user_id: str):
    db, products_collection = _get_db_and_collections()
    orders = list(db.orders.find({"user_id": user_id}).sort("_id", -1).limit(10))

    if not orders:
        return []  # new user case

    recent_pids = []
    for o in orders:
        for item in o["items"]:
            recent_pids.append(item["product_id"])

    # Get categories of purchased products
    categories = products_collection.find(
        {"_id": {"$in": recent_pids}},
        {"category": 1}
    )

    category_list = [c["category"] for c in categories]

    # Recommend items from same categories
    recommended = list(products_collection.find({
        "category": {"$in": category_list},
        "_id": {"$nin": recent_pids}  # avoid duplicates
    }).limit(10))

    return _serialize_products(recommended)


# --------------------------------------
# FREQUENTLY BOUGHT TOGETHER (co-occurrence)
# --------------------------------------
def get_frequently_bought_together(user_id: str):
    db, products_collection = _get_db_and_collections()
    combo = defaultdict(int)

    for order in db.orders.find():
        ids = [item["product_id"] for item in order["items"]]

        for i in ids:
            for j in ids:
                if i != j:
                    combo[(i, j)] += 1

    # find most paired with user's recent purchases
    orders = db.orders.find({"user_id": user_id}).sort("_id", -1).limit(5)
    user_items = []
    for o in orders:
        for item in o["items"]:
            user_items.append(item["product_id"])

    suggestions = set()
    for pid in user_items:
        for (i, j), count in combo.items():
            if i == pid and count > 0:
                suggestions.add(j)

    products = list(products_collection.find({"_id": {"$in": list(suggestions)}}).limit(10))
    return _serialize_products(products)
