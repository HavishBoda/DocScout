# DocScout

DocScout is a semantic document search tool that enables you to index and search through your personal documents (PDF, DOCX, TXT, HTML, MD) using advanced natural language processing. It leverages transformer-based embeddings and a vector database for efficient, meaningful search results.

---

## Features
- Semantic search: Find documents by meaning, not just keywords.
- Multi-format support: Index PDFs, DOCX, TXT, HTML, and Markdown files.
- Persistent vector database: Uses ChromaDB for scalable, persistent storage.
- Modern NLP: Utilizes `sentence-transformers` for high-quality embeddings.
- Command-line interface: Index or search your documents from the terminal.

---

## Project Structure

```
DocScout/
├── main.py              # CLI entry point
├── embeddings.py        # Indexing logic (extract, embed, store)
├── search.py            # Semantic search logic
├── file_extractor.py    # Recursively finds files to index
├── parser.py            # Extracts text from various file types
├── requirements.txt     # Python dependencies
├── README.md            # Project documentation
└── ...
```

---

## Quickstart

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd DocScout
```

### 2. Set Up the Virtual Environment
```bash
python3 -m venv docscout-env
source docscout-env/bin/activate
pip install -r requirements.txt
```

### 3. Start ChromaDB Server
ChromaDB must be running for DocScout to work. In a new terminal:
```bash
# Example (adjust as needed for your setup)
chromadb run --host localhost --port 8000
```

### 4. Run DocScout
```bash
python main.py
```

---

## Usage

When you run `main.py`, you will be prompted:

- (i) indexing: Index documents in a specified directory.
- (q) querying: Enter a natural language query to search your indexed documents.
- (e) exit: Quit the program.

### Example Workflow
1. Indexing: Choose `i` and specify a folder with your documents (for testing, use a small folder first).
2. Querying: Choose `q` and enter a search phrase (e.g., "project deadlines in 2023").
3. Results: The most relevant documents and their file paths will be displayed.

---

## Architecture Overview

1. File Extraction: Recursively finds all supported files in the target directory.
2. Text Parsing: Extracts text from each file (PDF, DOCX, HTML, TXT, MD).
3. Embedding: Uses a transformer model (`all-MiniLM-L6-v2`) to convert text into vector embeddings.
4. Storage: Stores embeddings, text, and file metadata in ChromaDB.
5. Semantic Search: For queries, embeds the search phrase and retrieves the most similar documents from ChromaDB.

---

## Customization

- Supported File Types: Edit `file_extractor.py` to add or remove file extensions.
- Embedding Model: Change the model in `embeddings.py` and `search.py` (e.g., try other `sentence-transformers` models).
- ChromaDB Settings: Adjust host/port in `embeddings.py` and `search.py` as needed.

---

## Extending DocScout
- Add a web interface: Use Streamlit or Flask for a user-friendly interface.
- Batch or parallel processing: Improve indexing speed for large datasets.
- Progress indicators: Add `tqdm` for feedback during long operations.
- Duplicate handling: Check for and avoid re-indexing the same files.
- Additional file types: Add support for images (OCR), spreadsheets, and more.

---

## Troubleshooting
- Indexing is slow: Start with a small folder. Indexing your entire home directory is not recommended.
- ChromaDB connection errors: Ensure ChromaDB is running and accessible at the specified host/port.
- Missing dependencies: Run `pip install -r requirements.txt` in your virtual environment.
- File parsing errors: Some files may be corrupted or unsupported; these are skipped silently.

---

## Contributing
1. Fork the repository and create your branch.
2. Add your feature or fix.
3. Write tests if applicable.
4. Submit a pull request with a clear description.

---

## License
Add your preferred open-source license here (e.g., MIT, Apache 2.0).

---

## Frequently Asked Questions
- **Can I use this on Windows?**
  - Yes, but you may need to adjust file paths and ensure all dependencies are available.
- **Can I use a GPU?**
  - If you have PyTorch and a compatible GPU, `sentence-transformers` will use it automatically.
- **How do I add more file types?**
  - Extend the logic in `parser.py` and `file_extractor.py`.

---

For questions or support, please open an issue or contact the maintainer. 