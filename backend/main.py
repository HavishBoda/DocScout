from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
from pathlib import Path
from embeddings import chroma_client, collection, index_documents
from file_extractor import home_dir, file_extensions
from search import semantic_search

app = FastAPI(title="DocScout API", description="Semantic document search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "Welcome to DocScout API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/files")
def get_files():
    try:
        results = collection.get()
        files = []
        if results['ids']:
            for i, file_id in enumerate(results['ids']):
                files.append({
                    "id": file_id,
                    "path": results['metadatas'][i]['path'] if results['metadatas'] else file_id,
                    "indexed_at": "2024-01-15T10:30:00Z"  # Change to real timestamp
                })
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=200, detail=f"Error fetching files: {str(e)}")

@app.post("/index")
def index_files():
    try:
        index_documents(home_dir, file_extensions)
        return {"message": "Files indexed successfully"}
    except Exception as e:
        raise HTTPException(status_code=200, detail=f"Error indexing files: {str(e)}")

@app.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    try:
        uploaded_files = []
        for file in files:
            # Check file extension
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in file_extensions:
                continue
            
            # Save file to upload directory
            file_path = upload_dir / file.filename
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            uploaded_files.append(str(file_path))
        
        if uploaded_files:
            # Index the uploaded files
            index_documents(upload_dir, file_extensions)
            return {"message": f"Uploaded and indexed {len(uploaded_files)} files"}
        else:
            return {"message": "No valid files uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading files: {str(e)}")

@app.post("/delete")
def delete_files(file_ids: dict):
    try:
        file_id_list = file_ids.get("file_ids", [])
        if not file_id_list:
            return {"message": "No files to delete"}
        
        # Delete from ChromaDB collection
        collection.delete(ids=file_id_list)
        return {"message": f"Deleted {len(file_id_list)} files from index"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting files: {str(e)}")

@app.get("/file/{file_id}")
def get_file_content(file_id: str):
    try:
        # Get file from collection
        results = collection.get(ids=[file_id])
        if not results['ids'] or not results['ids'][0]:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get the first (and should be only) result
        metadata = results['metadatas'][0][0] if results['metadatas'] and results['metadatas'][0] else {}
        documents = results['documents'][0][0] if results['documents'] and results['documents'][0] else ""
        
        return {
            "id": file_id,
            "metadata": metadata,
            "content": documents
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching file: {str(e)}")

@app.post("/search")
def search_documents(query: dict):
    try:
        search_text = query.get("query", "").strip()
        if not search_text:
            return {"results": [], "message": "Please provide a search query"}
        
        results = semantic_search(search_text, top_k=10)
        
        # Format results for frontend
        formatted_results = []
        if results['ids'] and results['ids'][0]:
            for i, doc_id in enumerate(results['ids'][0]):
                formatted_results.append({
                    "id": doc_id,
                    "content": results['documents'][0][i] if results['documents'] and results['documents'][0] else "",
                    "metadata": results['metadatas'][0][i] if results['metadatas'] and results['metadatas'][0] else {},
                    "distance": results['distances'][0][i] if results['distances'] and results['distances'][0] else 0
                })
        
        return {
            "results": formatted_results,
            "query": search_text,
            "total_results": len(formatted_results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)