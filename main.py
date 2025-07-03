import sys
from embeddings import index_documents
from search import semantic_search

user_input = input("Enter (i) indexing, (q) querying or (e) exit: ")
while user_input not in ["i", "q", "e"]:
    user_input = input("Invalid choice, enter either (i), (q), or (e): ")

if user_input == "i":
    from file_extractor import home_dir, file_extensions
    index_documents(home_dir, file_extensions)

elif user_input == "q":
    query = input("Enter your semantic search query: ")
    results = semantic_search(query)
    for i, doc in enumerate(results['documents'][0]):
        print(f"\nResult {i+1}:")
        print(doc[:500])  # Show first 500 characters
        print(f"File: {results['metadatas'][0][i]['path']}")

elif user_input == "e":
    sys.exit(0)
