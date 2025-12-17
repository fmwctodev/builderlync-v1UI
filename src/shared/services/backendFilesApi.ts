import { getAuthToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface FileRecord {
  id: number;
  user_id: number;
  folder_id: number | null;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  cloud_provider: 'google' | 'onedrive';
  cloud_file_id: string;
  description: string | null;
  created_at: string;
}

export interface FolderRecord {
  id: number;
  user_id: number;
  parent_id: number | null;
  name: string;
  cloud_provider: 'google' | 'onedrive';
  cloud_folder_id: string;
  created_at: string;
}

export interface CreateFolderData {
  name: string;
  cloudProvider: 'google' | 'onedrive';
  parentId?: number | null;
}

export interface UploadProgressCallback {
  (progress: number, fileName: string): void;
}

class BackendFilesApiService {
  private async getConnectionTokens() {
    try {
      const response = await fetch(`${API_BASE_URL}/file-manager/connection`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error getting connection tokens:', error);
      return null;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    };

    // Only add Content-Type for requests with body
    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getFiles(folderId?: number | null): Promise<{ data: FileRecord[]; pagination: any }> {
    const params = new URLSearchParams();
    if (folderId !== null && folderId !== undefined) {
      params.append('folderId', folderId.toString());
    }

    console.log('Getting files with params:', params.toString());
    const result = await this.makeRequest(`/oauth/documents?${params}`);
    console.log('Files API response:', result);
    return result.success ? result.data : { data: [], pagination: {} };
  }

  async searchFiles(searchTerm: string): Promise<FileRecord[]> {
    const { data } = await this.getFiles();
    return data.filter(file => 
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async uploadFile(
    file: File,
    folderId?: number | null,
    onProgress?: UploadProgressCallback
  ): Promise<FileRecord> {
    const connection = await this.getConnectionTokens();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cloudProvider', 'google');
    formData.append('accessToken', connection?.access_token || '');
    formData.append('description', '');
    if (folderId) formData.append('folderId', folderId.toString());

    const token = getAuthToken();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress, file.name);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/oauth/documents/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  async uploadMultipleFiles(
    files: File[],
    folderId?: number | null,
    onProgress?: UploadProgressCallback
  ): Promise<FileRecord[]> {
    const uploadedFiles: FileRecord[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploadedFile = await this.uploadFile(file, folderId, (progress) => {
          const overallProgress = ((i / files.length) * 100) + ((progress / files.length));
          onProgress?.(overallProgress, file.name);
        });
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    return uploadedFiles;
  }

  async getFileDownloadUrl(fileId: number): Promise<string> {
    return `${API_BASE_URL}/oauth/documents/${fileId}/download`;
  }

  async deleteFile(fileId: number): Promise<void> {
    await this.makeRequest(`/oauth/documents/${fileId}`, {
      method: 'DELETE',
    });
  }

  async renameFile(fileId: number, newName: string): Promise<void> {
    await this.makeRequest(`/oauth/documents/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ filename: newName }),
    });
  }

  async moveFile(fileId: number, newFolderId: number | null): Promise<void> {
    await this.makeRequest(`/oauth/documents/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ folderId: newFolderId }),
    });
  }

  async getFolders(parentId?: number | null): Promise<FolderRecord[]> {
    const params = new URLSearchParams();
    if (parentId !== null && parentId !== undefined) {
      params.append('parentId', parentId.toString());
    }

    console.log('Getting folders with params:', params.toString());
    const result = await this.makeRequest(`/oauth/documents/folders?${params}`);
    console.log('Folders API response:', result);
    return result.success ? result.data : [];
  }

  async createFolder(folderData: CreateFolderData): Promise<FolderRecord> {
    const connection = await this.getConnectionTokens();
    return this.makeRequest('/oauth/documents/folders', {
      method: 'POST',
      body: JSON.stringify({
        ...folderData,
        accessToken: connection?.access_token || ''
      }),
    });
  }

  async deleteFolder(folderId: number): Promise<void> {
    const connection = await this.getConnectionTokens();
    await this.makeRequest(`/oauth/documents/folders/${folderId}`, {
      method: 'DELETE',
      body: JSON.stringify({ accessToken: connection?.access_token || '' }),
    });
  }

  async renameFolder(folderId: number, newName: string): Promise<void> {
    await this.makeRequest(`/oauth/documents/folders/${folderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    });
  }

  async moveFolder(folderId: number, newParentFolderId: number | null): Promise<void> {
    await this.makeRequest(`/oauth/documents/folders/${folderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ parentId: newParentFolderId }),
    });
  }

  async getFolderBreadcrumbs(folderId: number): Promise<FolderRecord[]> {
    const breadcrumbs: FolderRecord[] = [];
    let currentFolderId: number | null = folderId;

    while (currentFolderId) {
      const folders = await this.getFolders();
      const folder = folders.find(f => f.id === currentFolderId);
      if (!folder) break;

      breadcrumbs.unshift(folder);
      currentFolderId = folder.parent_id;
    }

    return breadcrumbs;
  }

  async getFolderContents(folderId: number | null): Promise<{ folders: FolderRecord[]; files: FileRecord[] }> {
    console.log('Getting folder contents for folderId:', folderId);
    
    try {
      const [folders, filesResponse] = await Promise.all([
        this.getFolders(folderId),
        this.getFiles(folderId)
      ]);

      console.log('Folder contents result:', { folders, files: filesResponse.data });
      return { folders, files: filesResponse.data };
    } catch (error) {
      console.error('Error getting folder contents:', error);
      throw error;
    }
  }
}

export const backendFilesApi = new BackendFilesApiService();