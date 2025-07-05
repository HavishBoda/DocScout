'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fileType: '',
    dateRange: '',
    minSimilarity: 0.5
  });
  const [viewingFile, setViewingFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showUploadZone, setShowUploadZone] = useState(false);
  
  const fileInputRef = useRef(null);
  const uploadZoneRef = useRef(null);

  // Supported file types
  const supportedTypes = ['.pdf', '.md', '.txt', '.docx', '.html'];

  // Fetch files from backend
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/files');
      const data = await response.json();
      setFiles(data.files || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch files. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Index files
  const handleIndexFiles = async () => {
    try {
      setIndexing(true);
      const response = await fetch('http://localhost:8000/index', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        await fetchFiles();
      } else {
        setError(data.detail || 'Failed to index files');
      }
    } catch (err) {
      setError('Failed to index files. Make sure the backend is running.');
    } finally {
      setIndexing(false);
    }
  };

  // Search functionality
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      setError('');
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          filters: filters
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.results || []);
      } else {
        setError(data.detail || 'Search failed');
      }
    } catch (err) {
      setError('Failed to search. Make sure the backend is running.');
    } finally {
      setSearching(false);
    }
  };

  // File upload handling
  const handleFileUpload = async (files) => {
    const validFiles = Array.from(files).filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return supportedTypes.includes(extension);
    });

    if (validFiles.length === 0) {
      setError('No supported files selected. Supported: PDF, MD, TXT, DOCX, HTML');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      validFiles.forEach(file => formData.append('files', file));

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        await fetchFiles();
        setError('');
      } else {
        setError(data.detail || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload files. Make sure the backend is running.');
    } finally {
      setUploading(false);
    }
  };

  // Delete files from index
  const handleDeleteFiles = async (fileIds) => {
    try {
      const response = await fetch('http://localhost:8000/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_ids: Array.from(fileIds) }),
      });

      if (response.ok) {
        await fetchFiles();
        setSelectedFiles(new Set());
      } else {
        const data = await response.json();
        setError(data.detail || 'Delete failed');
      }
    } catch (err) {
      setError('Failed to delete files. Make sure the backend is running.');
    }
  };

  // View file content
  const handleViewFile = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:8000/file/${fileId}`);
      const data = await response.json();
      if (response.ok) {
        setViewingFile(data);
        setFileContent(data.content || 'No content available');
      } else {
        setError(data.detail || 'Failed to load file');
      }
    } catch (err) {
      setError('Failed to load file. Make sure the backend is running.');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setShowUploadZone(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setShowUploadZone(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setShowUploadZone(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  // Selection handlers
  const toggleFileSelection = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>DocScout</h1>
          <p>Semantic Document Search</p>
        </div>
      </header>

      <main className={styles.main}>
        {/* Search Section */}
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInput}>
              <input
                type="text"
                placeholder="Search your documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={styles.searchButton} disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          
          <div className={styles.searchControls}>
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterToggle}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            {searchResults.length > 0 && (
              <button 
                onClick={() => {
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className={styles.clearButton}
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filterGroup}>
                <label>File Type:</label>
                <select 
                  value={filters.fileType}
                  onChange={(e) => setFilters({...filters, fileType: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value=".pdf">PDF</option>
                  <option value=".md">Markdown</option>
                  <option value=".txt">Text</option>
                  <option value=".docx">Word</option>
                  <option value=".html">HTML</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label>Min Similarity:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.minSimilarity}
                  onChange={(e) => setFilters({...filters, minSimilarity: parseFloat(e.target.value)})}
                />
                <span>{filters.minSimilarity}</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <button 
              onClick={handleIndexFiles} 
              disabled={indexing}
              className={styles.indexButton}
            >
              {indexing ? 'Indexing...' : 'Index Files'}
            </button>
            <button 
              onClick={fetchFiles} 
              disabled={loading}
              className={styles.refreshButton}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          <div className={styles.controlGroup}>
            <button 
              onClick={() => setShowUploadZone(!showUploadZone)}
              className={styles.uploadButton}
            >
              Upload Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.md,.txt,.docx,.html"
              onChange={(e) => handleFileUpload(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Upload Zone */}
        {showUploadZone && (
          <div 
            ref={uploadZoneRef}
            className={styles.uploadZone}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.uploadContent}>
              <p>📁 Drop files here or click to select</p>
              <p className={styles.uploadHint}>
                Supported: PDF, Markdown, TXT, DOCX, HTML
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            <h2>Search Results ({searchResults.length})</h2>
            <div className={styles.resultList}>
              {searchResults.map((result, index) => (
                <div key={result.id || index} className={styles.resultItem}>
                  <div className={styles.resultInfo}>
                    <h3>{result.metadata?.path || result.id}</h3>
                    <p className={styles.resultContent}>
                      {result.content?.substring(0, 200)}...
                    </p>
                    <p className={styles.resultMeta}>
                      Similarity: {(1 - result.distance).toFixed(3)}
                    </p>
                  </div>
                  <div className={styles.resultActions}>
                    <button 
                      onClick={() => handleViewFile(result.id)}
                      className={styles.viewButton}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Section */}
        <div className={styles.filesSection}>
          <div className={styles.filesHeader}>
            <h2>Indexed Files ({files.length})</h2>
            {files.length > 0 && (
              <div className={styles.bulkActions}>
                <button 
                  onClick={selectAllFiles}
                  className={styles.selectAllButton}
                >
                  {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedFiles.size > 0 && (
                  <button 
                    onClick={() => handleDeleteFiles(selectedFiles)}
                    className={styles.deleteSelectedButton}
                  >
                    Delete Selected ({selectedFiles.size})
                  </button>
                )}
              </div>
            )}
          </div>
          
          {loading ? (
            <div className={styles.loading}>Loading files...</div>
          ) : files.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No files indexed yet. Click "Index Files" or "Upload Files" to get started.</p>
            </div>
          ) : (
            <div className={styles.fileList}>
              {files.map((file, index) => (
                <div key={file.id || index} className={styles.fileItem}>
                  <div className={styles.fileCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                    />
                  </div>
                  <div className={styles.fileInfo}>
                    <h3>{file.path}</h3>
                    <p>ID: {file.id}</p>
                    <p>Indexed: {file.indexed_at}</p>
                  </div>
                  <div className={styles.fileActions}>
                    <button 
                      onClick={() => handleViewFile(file.id)}
                      className={styles.viewButton}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDeleteFiles([file.id])}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{viewingFile.metadata?.path || viewingFile.id}</h2>
              <button 
                onClick={() => setViewingFile(null)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.fileContent}>
                <pre>{fileContent}</pre>
              </div>
              <div className={styles.modalActions}>
                <button 
                  onClick={() => window.open(`file://${viewingFile.metadata?.path}`, '_blank')}
                  className={styles.openButton}
                >
                  Open in Default App
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
