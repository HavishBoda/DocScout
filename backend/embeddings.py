from sentence_transformers import SentenceTransformer
from file_extractor import files_extractor
from parser import extract_text
import chromadb
from chromadb.config import Settings
import os


# ChromaDB client with persistence
chroma_client = chromadb.HttpClient(host="localhost", port=8000)
collection = chroma_client.get_or_create_collection("user_files")
model = SentenceTransformer("all-MiniLM-L6-v2")

def index_documents(root_dir, extensions=None):
    files = files_extractor(root_dir, extensions)
    for file_path in files:
        text = extract_text(file_path)
        if text.strip():
            embedding = model.encode(text)
            doc_id = os.path.abspath(file_path)
            collection.add(
                embeddings=[embedding],
                documents=[text],
                metadatas=[{"path": doc_id}],
                ids=[doc_id]
            )
    chroma_client.persist()