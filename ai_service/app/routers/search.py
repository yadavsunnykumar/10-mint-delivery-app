import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from fastapi import APIRouter
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
from db.mongo import get_connection
from rapidfuzz import process


def serialize_product(product):
    if "_id" in product:
        product["_id"] = str(product["_id"])
    return product

SYNONYMS = {
    "milk": ["amul milk", "dairy milk", "toned milk"],
    "bread": ["loaf", "brown bread"],
}


router = APIRouter()

# Get the absolute path to the vector store
vector_store_path = os.path.join(os.path.dirname(__file__), '../../app/vector_store/products_index.faiss')
model = SentenceTransformer("all-MiniLM-L6-v2")
_index = None

def get_index():
    global _index
    if _index is None:
        _index = faiss.read_index(vector_store_path)
    return _index

@router.get("/search")
def search_products(q: str):
    try:
        products_collection = get_connection()
        if products_collection is None:
            return {"error": "Database connection failed"}
            
        index = get_index()
        q_emb = model.encode([q])
        D, I = index.search(np.array(q_emb), k=10)

        products = list(products_collection.find({}))
        
        # DEBUG info
        # print(f"Found {len(products)} products in DB")
        # print(f"Indices: {I[0]}")

        if not products:
             return {"error": "No products in database", "indices": I[0].tolist()}

        results = []
        for i in I[0]:
            if i < len(products):
                results.append(serialize_product(products[i]))
            else:
                # Index out of bounds - ignoring or handling
                pass

        if len(results) == 0:
            fuzzy = fuzzy_fallback(q, products)
            if fuzzy:
                return {"results": [serialize_product(fuzzy)]}


        return {"results": results}
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}




def fuzzy_fallback(q, products):
    product_names = [p["name"] for p in products]
    match = process.extractOne(q, product_names)
    if match:
        return products[product_names.index(match[0])]
    return None
