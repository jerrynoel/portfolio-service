import { FileType } from '../services/FileService';

export interface FileDetailModel {
    description: string;
    downloadUrl: string;
    expiredTime: number | null;
    fileName: string;
    height?: number;
    id: string;
    size: number;
    timestamp: number;
    type: FileType;
    width?: number;
}
