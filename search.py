from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

chroma_client = chromadb.HttpClient(host="localhost", port=8000)
collection = chroma_client.get_or_create_collection("user_files")
model = SentenceTransformer("all-MiniLM-L6-v2")

def semantic_search(query, top_k=5):
    query_embedding = model.encode(query)
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)
    return results