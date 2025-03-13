// src/DicomUploadsSection.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DicomUploadsSectionStyles } from './types/styles';
import axios from 'axios';
import { API_URL } from './config';
import { Upload, X, FolderOpen, Share2, Trash2, Eye } from 'lucide-react';
import path from 'path';
import { timeStamp } from 'console';

interface DicomOrder {
  orderId: string;
  collaboratingDoctors: string[];
  patientId: string;
  status: {
    state: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    progress: number;
  };
  creationDate: string;
  lastUpdate: string;
}

interface FileWithPath extends File {
  webkitRelativePath: string;
}

const styles: DicomUploadsSectionStyles = {
  container: {
    width: '100%',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  entriesControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  entriesText: {
    fontSize: '0.875rem',
    color: '#9CA3AF',
  },
  entriesSelect: {
    backgroundColor: '#1E293B',
    border: '1px solid #4B5563',
    borderRadius: '0.375rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    color: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#9ca3af',
    backgroundColor: '#2d3748',
    borderRadius: '0.5rem',
  },
  emptyStateIcon: {
    margin: '0 auto 1rem',
  },
  emptyStateButton: {
    marginTop: '1rem',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #4B5563',
  },
  tabButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#9CA3AF',
    borderBottom: 'none',
    transition: 'color 0.2s, border-color 0.2s',
  },
  activeTabButton: {
    color: '#4F46E5',
    borderBottom: '2px solid #4F46E5',
  },
  uploadModal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: '0.5rem',
    padding: '2rem',
    width: '90%',
    maxWidth: '500px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  uploadArea: {
    border: '2px dashed #4B5563',
    borderRadius: '0.5rem',
    padding: '2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    marginBottom: '1.5rem',
  },
  uploadAreaActive: {
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#374151',
    border: '1px solid #4B5563',
    borderRadius: '0.375rem',
    color: 'white',
    marginBottom: '1rem',
  },
  uploadButton: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  filePreview: {
    backgroundColor: '#374151',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
  },
  fileName: {
    color: 'white',
    marginBottom: '0.25rem',
  },
  fileSize: {
    color: '#9CA3AF',
    fontSize: '0.875rem',
  },
  folderStructure: {
    backgroundColor: '#374151',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  folderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem 0',
    color: '#D1D5DB',
    fontSize: '0.875rem',
  },
  folderIcon: {
    color: '#60A5FA',
  },
  fileIcon: {
    color: '#9CA3AF',
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#1E293B',
    border: '1px solid #4B5563',
    borderRadius: '0.375rem',
    padding: '0.5rem 1rem 0.5rem 2.5rem',
    fontSize: '0.875rem',
    color: 'white',
    width: '16rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '1rem',
    height: '1rem',
    color: '#9CA3AF',
  },
  table: {
    width: '100%',
  },
  tableContainer: {
    backgroundColor: '#1E293B',
    borderRadius: '0.5rem',
    border: '1px solid #4B5563',
    overflow: 'hidden',
  },
  tableHeader: {
    borderBottom: '1px solid #4B5563',
  },
  tableHeaderCell: {
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#9CA3AF',
  },
  tableRow: {
    backgroundColor: 'inherit',
    transition: 'background-color 0.15s',
  },
  tableCell: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#D1D5DB',
  },
  statusContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  statusText: {
    fontSize: '0.875rem',
    color: '#D1D5DB',
  },
  progressBar: {
    width: '100%',
    height: '0.5rem',
    backgroundColor: '#4B5563',
    borderRadius: '9999px',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '9999px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
  },
  paginationInfo: {
    fontSize: '0.875rem',
    color: '#9CA3AF',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  paginationButton: {
    padding: '0.5rem',
    backgroundColor: '#1E293B',
    border: '1px solid #4B5563',
    borderRadius: '0.375rem',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  paginationNumbers: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  paginationActive: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4F46E5',
    color: 'white',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

// Helper functions remain the same
const getStatusText = (state: DicomOrder['status']['state']): string => {
  const statusMap: Record<DicomOrder['status']['state'], string> = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return statusMap[state];
};

const getStatusColor = (state: DicomOrder['status']['state']): string => {
  const colorMap: Record<DicomOrder['status']['state'], string> = {
    PENDING: '#FCD34D',
    IN_PROGRESS: '#60A5FA',
    COMPLETED: '#34D399',
    CANCELLED: '#EF4444',
  };
  return colorMap[state];
};

const DicomUploadsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [orders, setOrders] = useState<DicomOrder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([]);
  const [patientId, setPatientId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return orders.slice(startIndex, endIndex);
  }, [orders, currentPage, entriesPerPage]);

  const fetchOrders = useCallback(async () => {
    try {
      const status = activeTab === 'current' ? 'PENDING,IN_PROGRESS' : 'COMPLETED';
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/dicom/orders?status=${status}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [activeTab, fetchOrders]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files) as FileWithPath[]);
      setUploadError(null);
    }
  };

  const validateFiles = (files: FileWithPath[]): { valid: boolean; error?: string } => {
    try {
      const maxFileSize = 100 * 1024 * 1024; // 100MB limit
      const invalidFiles = files.filter((file) => {
        const fileName = file.name.toLowerCase();
        const isValidType = fileName.endsWith('.dcm') || 
                          fileName.endsWith('.dicom') || 
                          !fileName.includes('.'); // For files without extension
        const isValidSize = file.size <= maxFileSize;
        return !isValidType || !isValidSize;
      });

      if (invalidFiles.length > 0) {
        const invalidFilesList = invalidFiles
          .map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`)
          .join(', ');
        return {
          valid: false,
          error: `Invalid files detected: ${invalidFilesList}. Files must be DICOM format and under 100MB.`
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('File validation error:', error);
      return {
        valid: false,
        error: 'Error validating files. Please try again.'
      };
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);

    const items = e.dataTransfer.items;
    if (items) {
      const filesList: FileWithPath[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry?.isDirectory) {
            await traverseDirectory(entry as FileSystemDirectoryEntry, '', filesList);
          } else {
            const file = item.getAsFile();
            if (file) {
              const fileWithPath = file as FileWithPath;
              // Only set webkitRelativePath if it's not already set
              if (!fileWithPath.webkitRelativePath) {
                Object.defineProperty(fileWithPath, 'webkitRelativePath', {
                  value: file.name,
                  writable: false,
                  configurable: true
                });
              }
              filesList.push(fileWithPath);
            }
          }
        }
      }

      if (filesList.length > 0) {
        setSelectedFiles(filesList);
      }
    }
  };

  const traverseDirectory = async (
    dirEntry: FileSystemDirectoryEntry,
    path: string,
    filesList: FileWithPath[]
  ): Promise<void> => {
    const reader = dirEntry.createReader();
    const entries = await new Promise<FileSystemEntry[]>((resolve) => {
      reader.readEntries((entries) => resolve(entries));
    });

    for (const entry of entries) {
      const newPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.isDirectory) {
        await traverseDirectory(entry as FileSystemDirectoryEntry, newPath, filesList);
      } else {
        const file = await getFileFromEntry(entry as FileSystemFileEntry);
        if (file) {
          Object.defineProperty(file, 'webkitRelativePath', {
            value: newPath,
            writable: false,
          });
          filesList.push(file as FileWithPath);
        }
      }
    }
  };

  const getFileFromEntry = (fileEntry: FileSystemFileEntry): Promise<File> => {
    return new Promise((resolve) => {
      fileEntry.file((file) => resolve(file));
    });
  };

  const handleUpload = async () => {
    const maxRetries = 1;
    let currentTry = 0;
    if (selectedFiles.length === 0 || !patientId) return;

    while (currentTry < maxRetries){
      try{
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
        // console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
        // console.log('Token value:', token); // Be careful logging full tokens in production
        
        if (!token) {
          setUploadError('Authentication token not found');
          return;
        }

        // Log the headers being sent
        /* console.log('Request headers:', {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token.substring(0, 10)}...` 
        }); */

        // Validate files
        const validation = validateFiles(selectedFiles);
        if (!validation.valid) {
          setUploadError(validation.error || 'Invalid files');
          return;
        }

        const formData = new FormData();

        // Append files with their relative paths
        selectedFiles.forEach((file) => {
          formData.append('files', file);
          formData.append('paths', file.webkitRelativePath);
        });

        formData.append('patientId', patientId);

        let lastLoaded = 0;
        let lastTime = Date.now();

        // Log the file details before upload
        /* console.log('Starting upload with details:', {
          totalFiles: selectedFiles.length,
          totalSize: selectedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024) + ' MB',
          firstFilePath: selectedFiles[0]?.webkitRelativePath || 'No path'
        }); */
          const response = await axios.post<{ success: boolean; message: string }>(
            `${API_URL}/api/dicom/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },

              // Add timeout configuration
              timeout: 3600000, // 1 hour timeout
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
              
              onUploadProgress: (progressEvent) => {
                const currentTime = Date.now();
                const timeDiff = currentTime - lastTime;
                const loadedDiff = progressEvent.loaded - lastLoaded;

                const uploadSpeed = (loadedDiff/1024/1024) / (timeDiff/1000);

                const progress = progressEvent.total
                  ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                  : 0;
                /* console.log(`Upload progress ${progress}%:`, {
                  bytesUploaded: `${(progressEvent.loaded / 1024 / 1024).toFixed(2)}MB`,
                  uploadSpeed: `${(uploadSpeed).toFixed(2)}MB/s`,
                  timeStamp: new Date().toLocaleTimeString()
                }); */

                lastLoaded = progressEvent.loaded;
                lastTime = currentTime;
                setUploadProgress(progress);
              },
            }
          );

          if (response.data.success) {
            setShowUploadModal(false);
            setSelectedFiles([]);
            setPatientId('');
            setUploadProgress(0);
            setUploadError(null);
            await fetchOrders();
            break;
          } else {
            throw new Error(response.data.message || 'Upload failed');
          }

      }catch (error){
        currentTry++;
        /* console.log(`Upload attempt ${currentTry} failed:`, error); */

        if (currentTry >= maxRetries) {
          //Handle Final Error
          if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message;
            setUploadError(`Upload failed: ${message}`);
          } else if (error instanceof Error) {
            setUploadError(`Upload error: ${error.message}`);
          } else {
            setUploadError('An unknown error occurred during upload');
          }
        } else {
          //Retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        setUploadProgress(0);
      }
    };
  };

  const renderFolderStructure = () => {
    const structure = new Map<string, FileWithPath[]>();

    // console.log('*** Upload file path ***', selectedFiles[0].webkitRelativePath);  LOGS: Works correctly 20/01/2025 

    selectedFiles.forEach((file) => {
      const path = file.webkitRelativePath.split('/');
      path.pop(); // Remove filename
      const dirPath = path.join('/');

      if (!structure.has(dirPath)) {
        structure.set(dirPath, []);
      }
      structure.get(dirPath)?.push(file);
    });

    return (
      <div style={styles.folderStructure}>
        {Array.from(structure.entries()).map(([path, files]) => (
          <div key={path}>
            <div style={styles.folderItem}>
              <FolderOpen size={16} style={styles.folderIcon} />
              {path || 'Root'}
            </div>
            {files.map((file) => (
              <div
                key={file.webkitRelativePath}
                style={{ ...styles.folderItem, paddingLeft: '1rem' }}
              >
                <Eye size={16} style={styles.fileIcon} />
                {file.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.tabs}>
          {(['current', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab ? styles.activeTabButton : {}),
              }}
            >
              {tab === 'current' ? 'Current Orders' : 'Completed Orders'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowUploadModal(true)} style={styles.uploadButton}>
          <Upload size={20} />
          Upload DICOM Files
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.uploadModal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Upload DICOM Files</h3>
              <button onClick={() => setShowUploadModal(false)} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                ...styles.uploadArea,
                ...(isDragging ? styles.uploadAreaActive : {}),
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                webkitdirectory=""
                directory=""
                multiple
              />
              <Upload size={32} style={{ margin: '0 auto', marginBottom: '1rem' }} />
              <p>Drag and drop DICOM folders here or click to browse</p>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
                You can upload entire folders containing DICOM files
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <>
                <div style={styles.filePreview}>
                  <p style={styles.fileName}>Selected {selectedFiles.length} file(s)</p>
                  <p style={styles.fileSize}>
                    Total size:{' '}
                    {(
                      selectedFiles.reduce((acc, file) => acc + file.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}{' '}
                    MB
                  </p>
                </div>
                {renderFolderStructure()}
              </>
            )}

            {uploadError && (
              <div
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {uploadError}
              </div>
            )}

            <input
              type="text"
              placeholder="Patient ID (Only visible to you)"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              style={styles.input}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#4B5563',
                  borderRadius: '2px',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: '#4F46E5',
                    borderRadius: '2px',
                    transition: 'width 0.2s',
                  }}
                />
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || !patientId || uploadProgress > 0}
              style={{
                ...styles.uploadButton,
                ...(selectedFiles.length === 0 || !patientId || uploadProgress > 0
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {uploadProgress > 0 ? `Uploading (${uploadProgress}%)` : 'Upload Files'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              {[
                'Order ID',
                'Collaborating Doctors',
                'Patient ID',
                'Status',
                'Creation Date',
                'Last Update',
              ].map((header) => (
                <th key={header} style={styles.tableHeaderCell}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.orderId} style={styles.tableRow}>
                <td style={{ ...styles.tableCell, color: 'white' }}>{order.orderId}</td>
                <td style={styles.tableCell}>{order.collaboratingDoctors.join(', ')}</td>
                <td style={styles.tableCell}>{order.patientId}</td>
                <td style={{ ...styles.tableCell, padding: '1rem' }}>
                  <div style={styles.statusContainer}>
                    <span style={styles.statusText}>{getStatusText(order.status.state)}</span>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${order.status.progress}%`,
                          backgroundColor: getStatusColor(order.status.state),
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td style={styles.tableCell}>{order.creationDate}</td>
                <td style={styles.tableCell}>{order.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <div style={styles.paginationInfo}>
          Showing {Math.min(1 + (currentPage - 1) * entriesPerPage, orders.length)} to{' '}
          {Math.min(currentPage * entriesPerPage, orders.length)} of {orders.length} entries
        </div>
        <div style={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            style={{
              ...styles.paginationButton,
              ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
            }}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={styles.paginationNumbers}>
            <button style={styles.paginationActive}>1</button>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{
              ...styles.paginationButton,
              ...(currentPage * entriesPerPage >= orders.length
                ? styles.paginationButtonDisabled
                : {}),
            }}
            disabled={currentPage * entriesPerPage >= orders.length}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DicomUploadsSection;
