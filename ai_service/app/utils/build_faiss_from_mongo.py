import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
from db.mongo import products_collection

def build_faiss_index():
    model = SentenceTransformer("all-MiniLM-L6-v2")

    products = list(products_collection.find({}))
    product_texts = [
        f"{p['name']} {', '.join(p.get('tags', []))}" for p in products
    ]

    vectors = model.encode(product_texts)
    dim = vectors.shape[1]

    index = faiss.IndexFlatL2(dim)
    index.add(np.array(vectors))

    faiss.write_index(index, "app/vector_store/products_index.faiss")

    return True
