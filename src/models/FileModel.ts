import { FileType } from '../services/FileService';

export interface FileModel {
    businessId?: string;
    contentType: string | null;
    createdUserId: string;
    description: string;
    expireUploadTime: number;
    fileId: string;
    height?: number;
    key: string;
    originalName: string;
    public: boolean;
    size: number;
    timestamp: number;
    type: FileType;
    width?: number;
}
