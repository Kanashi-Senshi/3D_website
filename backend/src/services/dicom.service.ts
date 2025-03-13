// backend/src/services/dicom.service.ts
import axios, { AxiosProgressEvent } from 'axios';
import { Buffer } from 'buffer';

export interface DicomFile extends File {
  webkitRelativePath: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  progress: number;
  fileIndex: number;
  fileName: string;
}

export class DicomService {
  private static readonly MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  private static readonly MAX_CONCURRENT_UPLOADS = 3;
  private static readonly VALID_DICOM_HEADERS = [
    [0x44, 0x49, 0x43, 0x4D], // "DICM"
    [0x00, 0x00, 0x00, 0x00] // Some old DICOM files
  ];

  constructor(
    private baseUrl: string,
    private authToken: string,
    private onProgress?: (progress: UploadProgress) => void
  ) {}

  private async validateDicomHeader(file: DicomFile): Promise<boolean> {
    try {
      // Get the first 132 bytes of the file
      const buffer = await file.arrayBuffer();
      const headerBytes = new Uint8Array(buffer.slice(0, 132));
      
      // Check for DICOM magic number at offset 128
      const header = Array.from(headerBytes.slice(128, 132));
      
      return DicomService.VALID_DICOM_HEADERS.some(validHeader =>
        validHeader.every((byte, i) => byte === header[i])
      );
    } catch (error) {
      console.error('Error validating DICOM header:', error);
      // If we can't validate the header, assume it's valid and let the server handle validation
      return true;
    }
  }

  private async validateDicomFile(file: DicomFile): Promise<{ valid: boolean; error?: string }> {
    try {
      // Size validation
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB max
      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File ${file.name} exceeds maximum size of 2GB`
        };
      }

      // Extension validation
      const validExtensions = ['.dcm', '.dicom', ''];
      const hasValidExtension = validExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        return {
          valid: false,
          error: `File ${file.name} is not a DICOM file`
        };
      }

      // Header validation
      const hasValidHeader = await this.validateDicomHeader(file);
      if (!hasValidHeader) {
        return {
          valid: false,
          error: `File ${file.name} is not a valid DICOM file`
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Error validating file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async uploadChunk(
    chunk: Blob,
    fileId: string,
    chunkIndex: number,
    totalChunks: number
  ): Promise<void> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('fileId', fileId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());

    await axios.post(`${this.baseUrl}/api/dicom/chunks`, formData, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  private async uploadFileInChunks(
    file: DicomFile,
    fileIndex: number,
    totalFiles: number
  ): Promise<void> {
    const fileId = `${Date.now()}-${file.name}`;
    const totalChunks = Math.ceil(file.size / DicomService.MAX_CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * DicomService.MAX_CHUNK_SIZE;
      const end = Math.min(start + DicomService.MAX_CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      await this.uploadChunk(chunk, fileId, i, totalChunks);

      if (this.onProgress) {
        this.onProgress({
          loaded: end,
          total: file.size,
          progress: (end / file.size) * 100,
          fileIndex,
          fileName: file.name
        });
      }
    }
  }

  private generateFolderStructure(files: DicomFile[]): Map<string, DicomFile[]> {
    const structure = new Map<string, DicomFile[]>();
    Object.entries(files[0]).forEach(([key, value]) => {
      /* console.log(`${key}: ${value}`); */
    });

    files.forEach(file => {
      
      const filePath = file.webkitRelativePath || file.name;
      const path = filePath.split('/');
      path.pop(); // Remove filename
      const dirPath = path.join('/') || '/';

      if (!structure.has(dirPath)) {
        structure.set(dirPath, []);
      }
      structure.get(dirPath)?.push(file);
    });

    return structure;
  }

  public async uploadDicomFolder(
    files: DicomFile[],
    patientId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      /* console.log('Starting DICOM folder upload:', {
        totalFiles: files.length,
        patientId,
        timestamp: new Date().toISOString()
      }); */
  
      // Validate all files first
      /* console.log('Starting file validation...'); */
      const validations = await Promise.all(
        files.map(file => this.validateDicomFile(file))
      );
  
      const invalidFiles = validations
        .map((validation, index) => ({ validation, file: files[index] }))
        .filter(({ validation }) => !validation.valid);
  
      if (invalidFiles.length > 0) {
        console.error('File validation failed:', {
          totalFiles: files.length,
          invalidCount: invalidFiles.length,
          errors: invalidFiles.map(({ file }) => file.name)
        });
        return {
          success: false,
          error: invalidFiles
            .map(({ validation, file }) => validation.error || `Invalid file: ${file.name}`)
            .join('\n')
        };
      }
      /* console.log('File validation completed successfully'); */
  
      // Generate folder structure
      /* console.log('Generating folder structure...'); */
      const folderStructure = this.generateFolderStructure(files);
      /* console.log('Folder structure generated:', {
        folders: Array.from(folderStructure.keys()),
        totalFolders: folderStructure.size
      }); */
  
      // Upload folder structure first
      /* console.log('Uploading folder structure to server...'); */
      try {
        await axios.post(
          `${this.baseUrl}/api/dicom/folder-structure`,
          {
            patientId,
            structure: Array.from(folderStructure.keys()),
          },
          {
            headers: { 
              Authorization: `Bearer ${this.authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        /* console.log('Folder structure uploaded successfully'); */
      } catch (error) {
        console.error('Folder structure upload failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          status: axios.isAxiosError(error) ? error.response?.status : 'unknown',
          data: axios.isAxiosError(error) ? error.response?.data : null
        });
        throw error;
      }
      /* console.log('Folder structure uploaded successfully'); */
  
      // Upload files in batches with limited concurrency
      const totalFiles = files.length;
      const totalBatches = Math.ceil(totalFiles / DicomService.MAX_CONCURRENT_UPLOADS);
      /* console.log('Starting file upload in batches:', {
        totalFiles,
        batchSize: DicomService.MAX_CONCURRENT_UPLOADS,
        totalBatches
      }); */
  
      for (let i = 0; i < totalFiles; i += DicomService.MAX_CONCURRENT_UPLOADS) {
        const batchNumber = Math.floor(i / DicomService.MAX_CONCURRENT_UPLOADS) + 1;
        const batch = files.slice(i, i + DicomService.MAX_CONCURRENT_UPLOADS);
        
        /* console.log(`Processing batch ${batchNumber}/${totalBatches}:`, {
          batchSize: batch.length,
          startIndex: i,
          endIndex: Math.min(i + DicomService.MAX_CONCURRENT_UPLOADS, totalFiles)
        }); */
  
        await Promise.all(
          batch.map((file, batchIndex) => {
            /* console.log(`Starting upload for file in batch ${batchNumber}:`, {
              fileName: file.name,
              fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
              fileIndex: i + batchIndex,
              totalFiles
            }); */
            return this.uploadFileInChunks(file, i + batchIndex, totalFiles);
          })
        );
        /* console.log(`Completed batch ${batchNumber}/${totalBatches}`); */
      }
  
      /* console.log('DICOM folder upload completed successfully:', {
        totalFiles,
        totalFolders: folderStructure.size,
        timestamp: new Date().toISOString()
      }); */
  
      return { success: true };
    } catch (error) {
      console.error('DICOM folder upload failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during upload'
      };
    }
  }
}