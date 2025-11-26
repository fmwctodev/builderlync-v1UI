import { supabase } from '../lib/supabase';

export type StorageType = 'local' | 'google_drive' | 'onedrive';

export interface FileRecord {
  id: string;
  organization_id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_type: StorageType;
  storage_path: string;
  folder_id: string | null;
  thumbnail_url: string | null;
  cloud_metadata: Record<string, any>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface FolderRecord {
  id: string;
  organization_id: string;
  user_id: string;
  folder_name: string;
  parent_folder_id: string | null;
  storage_type: StorageType;
  path: string;
  cloud_folder_id: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadProgressCallback {
  (progress: number, fileName: string): void;
}

export interface CreateFolderData {
  folder_name: string;
  parent_folder_id?: string | null;
  storage_type?: StorageType;
  color?: string | null;
}

class FilesApiService {
  private getCurrentUserId(): string {
    const user = supabase.auth.getSession();
    return user as any;
  }

  private async getOrganizationId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: staffData, error } = await supabase
      .from('staff')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !staffData) {
      throw new Error('Organization not found for user');
    }

    return staffData.organization_id;
  }

  async getFiles(folderId?: string | null, storageType: StorageType = 'local'): Promise<FileRecord[]> {
    const query = supabase
      .from('files')
      .select('*')
      .eq('is_deleted', false)
      .eq('storage_type', storageType)
      .order('created_at', { ascending: false });

    if (folderId) {
      query.eq('folder_id', folderId);
    } else {
      query.is('folder_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async searchFiles(searchTerm: string, storageType?: StorageType): Promise<FileRecord[]> {
    const query = supabase
      .from('files')
      .select('*')
      .eq('is_deleted', false)
      .ilike('file_name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (storageType) {
      query.eq('storage_type', storageType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async uploadFile(
    file: File,
    folderId?: string | null,
    onProgress?: UploadProgressCallback
  ): Promise<FileRecord> {
    try {
      const organizationId = await this.getOrganizationId();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const folderPath = folderId ? await this.getFolderPath(folderId) : '';
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `${organizationId}/${folderPath}${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('organization-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      let thumbnailUrl: string | null = null;
      if (file.type.startsWith('image/')) {
        const { data: { publicUrl } } = supabase.storage
          .from('organization-files')
          .getPublicUrl(storagePath);
        thumbnailUrl = publicUrl;
      }

      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          organization_id: organizationId,
          user_id: user.id,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_type: 'local',
          storage_path: storagePath,
          folder_id: folderId || null,
          thumbnail_url: thumbnailUrl,
          cloud_metadata: {},
          is_deleted: false
        })
        .select()
        .single();

      if (dbError) throw dbError;

      onProgress?.(100, file.name);
      return fileRecord;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(
    files: File[],
    folderId?: string | null,
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

  async getFileDownloadUrl(fileId: string): Promise<string> {
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select('storage_path')
      .eq('id', fileId)
      .single();

    if (fileError || !fileRecord) throw new Error('File not found');

    const { data, error } = await supabase.storage
      .from('organization-files')
      .createSignedUrl(fileRecord.storage_path, 3600);

    if (error) throw error;
    return data.signedUrl;
  }

  async deleteFile(fileId: string): Promise<void> {
    const { data: fileRecord, error: fetchError } = await supabase
      .from('files')
      .select('storage_path')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;

    const { error: storageError } = await supabase.storage
      .from('organization-files')
      .remove([fileRecord.storage_path]);

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from('files')
      .update({ is_deleted: true })
      .eq('id', fileId);

    if (dbError) throw dbError;
  }

  async renameFile(fileId: string, newName: string): Promise<void> {
    const { error } = await supabase
      .from('files')
      .update({ file_name: newName })
      .eq('id', fileId);

    if (error) throw error;
  }

  async moveFile(fileId: string, newFolderId: string | null): Promise<void> {
    const { error } = await supabase
      .from('files')
      .update({ folder_id: newFolderId })
      .eq('id', fileId);

    if (error) throw error;
  }

  async getFolders(parentFolderId?: string | null, storageType: StorageType = 'local'): Promise<FolderRecord[]> {
    const query = supabase
      .from('folders')
      .select('*')
      .eq('storage_type', storageType)
      .order('created_at', { ascending: false });

    if (parentFolderId) {
      query.eq('parent_folder_id', parentFolderId);
    } else {
      query.is('parent_folder_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async createFolder(folderData: CreateFolderData): Promise<FolderRecord> {
    const organizationId = await this.getOrganizationId();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let path = folderData.folder_name;
    if (folderData.parent_folder_id) {
      const parentPath = await this.getFolderPath(folderData.parent_folder_id);
      path = `${parentPath}${folderData.folder_name}/`;
    } else {
      path = `${folderData.folder_name}/`;
    }

    const { data, error } = await supabase
      .from('folders')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        folder_name: folderData.folder_name,
        parent_folder_id: folderData.parent_folder_id || null,
        storage_type: folderData.storage_type || 'local',
        path: path,
        color: folderData.color || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFolder(folderId: string): Promise<void> {
    const { data: files } = await supabase
      .from('files')
      .select('id')
      .eq('folder_id', folderId);

    if (files && files.length > 0) {
      throw new Error('Folder is not empty. Please delete all files first.');
    }

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);

    if (error) throw error;
  }

  async renameFolder(folderId: string, newName: string): Promise<void> {
    const { data: folder, error: fetchError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .single();

    if (fetchError) throw fetchError;

    const pathParts = folder.path.split('/').filter(Boolean);
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/') + '/';

    const { error } = await supabase
      .from('folders')
      .update({
        folder_name: newName,
        path: newPath
      })
      .eq('id', folderId);

    if (error) throw error;
  }

  async moveFolder(folderId: string, newParentFolderId: string | null): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .update({ parent_folder_id: newParentFolderId })
      .eq('id', folderId);

    if (error) throw error;
  }

  private async getFolderPath(folderId: string): Promise<string> {
    const { data, error } = await supabase
      .from('folders')
      .select('path')
      .eq('id', folderId)
      .single();

    if (error || !data) return '';
    return data.path;
  }

  async getFolderBreadcrumbs(folderId: string): Promise<FolderRecord[]> {
    const breadcrumbs: FolderRecord[] = [];
    let currentFolderId: string | null = folderId;

    while (currentFolderId) {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', currentFolderId)
        .single();

      if (error || !data) break;

      breadcrumbs.unshift(data);
      currentFolderId = data.parent_folder_id;
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

export const filesApi = new FilesApiService();
