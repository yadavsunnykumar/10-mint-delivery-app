import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

def build_vector_store():
    df = pd.read_json("products.json")  # temporary dataset
    texts = df["name"].tolist()

    model = SentenceTransformer("all-MiniLM-L6-v2")
    vectors = model.encode(texts)

    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(vectors))

    faiss.write_index(index, "app/vector_store/products_index.faiss")
    np.save("app/vector_store/embeddings.npy", vectors)
