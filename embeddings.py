from file_extractor import files_extractor

from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import PyPDF2
from docx import Document
from bs4 import BeautifulSoup


chroma_client = chromadb.Client()

collection = chroma_client.get_or_create_collection("user_files")