from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from embeddings import chroma_client, collection, index_documents
from file_extractor import home_dir, file_extensions

app = FastAPI(title="DocScout API", description="Semantic document search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)