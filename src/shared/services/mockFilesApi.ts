import { FileRecord, FolderRecord, CreateFolderData, UploadProgressCallback } from './filesApi';

// Mock data for development
let mockFolders: FolderRecord[] = [];
let mockFiles: FileRecord[] = [];
let nextId = 1;

class MockFilesApiService {
  private generateId(): string {
    return (nextId++).toString();
  }

  private getCurrentUserId(): string {
    return 'mock-user-id';
  }

  private getOrganizationId(): string {
    return localStorage.getItem('currentOrganizationId') || 'mock-org-id';
  }

  async getFiles(folderId?: string | null): Promise<FileRecord[]> {
    return mockFiles.filter(file => file.folder_id === folderId);
  }

  async searchFiles(searchTerm: string): Promise<FileRecord[]> {
    return mockFiles.filter(file => 
      file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async uploadFile(
    file: File,
    folderId?: string | null,
    onProgress?: UploadProgressCallback
  ): Promise<FileRecord> {
    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => onProgress(i, file.name), i * 10);
      }
    }

    const mockFile: FileRecord = {
      id: this.generateId(),
      organization_id: this.getOrganizationId(),
      user_id: this.getCurrentUserId(),
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_type: 'local',
      storage_path: `mock-path/${file.name}`,
      folder_id: folderId || null,
      thumbnail_url: null,
      cloud_metadata: {},
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockFiles.push(mockFile);
    return mockFile;
  }

  async uploadMultipleFiles(
    files: File[],
    folderId?: string | null,
    onProgress?: UploadProgressCallback
  ): Promise<FileRecord[]> {
    const uploadedFiles: FileRecord[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadedFile = await this.uploadFile(file, folderId, (progress) => {
        const overallProgress = ((i / files.length) * 100) + ((progress / files.length));
        onProgress?.(overallProgress, file.name);
      });
      uploadedFiles.push(uploadedFile);
    }

    return uploadedFiles;
  }

  async getFileDownloadUrl(fileId: string): Promise<string> {
    const file = mockFiles.find(f => f.id === fileId);
    if (!file) throw new Error('File not found');
    return `mock-download-url/${file.file_name}`;
  }

  async deleteFile(fileId: string): Promise<void> {
    const index = mockFiles.findIndex(f => f.id === fileId);
    if (index !== -1) {
      mockFiles.splice(index, 1);
    }
  }

  async renameFile(fileId: string, newName: string): Promise<void> {
    const file = mockFiles.find(f => f.id === fileId);
    if (file) {
      file.file_name = newName;
      file.updated_at = new Date().toISOString();
    }
  }

  async moveFile(fileId: string, newFolderId: string | null): Promise<void> {
    const file = mockFiles.find(f => f.id === fileId);
    if (file) {
      file.folder_id = newFolderId;
      file.updated_at = new Date().toISOString();
    }
  }

  async getFolders(parentFolderId?: string | null): Promise<FolderRecord[]> {
    return mockFolders.filter(folder => folder.parent_folder_id === parentFolderId);
  }

  async createFolder(folderData: CreateFolderData): Promise<FolderRecord> {
    const mockFolder: FolderRecord = {
      id: this.generateId(),
      organization_id: this.getOrganizationId(),
      user_id: this.getCurrentUserId(),
      folder_name: folderData.folder_name,
      parent_folder_id: folderData.parent_folder_id || null,
      storage_type: folderData.storage_type || 'local',
      path: folderData.parent_folder_id ? 
        `parent-path/${folderData.folder_name}/` : 
        `${folderData.folder_name}/`,
      cloud_folder_id: null,
      color: folderData.color || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockFolders.push(mockFolder);
    return mockFolder;
  }

  async deleteFolder(folderId: string): Promise<void> {
    const files = mockFiles.filter(f => f.folder_id === folderId);
    if (files.length > 0) {
      throw new Error('Folder is not empty. Please delete all files first.');
    }

    const index = mockFolders.findIndex(f => f.id === folderId);
    if (index !== -1) {
      mockFolders.splice(index, 1);
    }
  }

  async renameFolder(folderId: string, newName: string): Promise<void> {
    const folder = mockFolders.find(f => f.id === folderId);
    if (folder) {
      folder.folder_name = newName;
      folder.updated_at = new Date().toISOString();
    }
  }

  async moveFolder(folderId: string, newParentFolderId: string | null): Promise<void> {
    const folder = mockFolders.find(f => f.id === folderId);
    if (folder) {
      folder.parent_folder_id = newParentFolderId;
      folder.updated_at = new Date().toISOString();
    }
  }

  async getFolderBreadcrumbs(folderId: string): Promise<FolderRecord[]> {
    const breadcrumbs: FolderRecord[] = [];
    let currentFolderId: string | null = folderId;

    while (currentFolderId) {
      const folder = mockFolders.find(f => f.id === currentFolderId);
      if (!folder) break;

      breadcrumbs.unshift(folder);
      currentFolderId = folder.parent_folder_id;
    }

    return breadcrumbs;
  }

  async getFolderContents(folderId: string | null): Promise<{ folders: FolderRecord[]; files: FileRecord[] }> {
    const [folders, files] = await Promise.all([
      this.getFolders(folderId),
      this.getFiles(folderId)
    ]);

    return { folders, files };
  }
}

export const mockFilesApi = new MockFilesApiService();