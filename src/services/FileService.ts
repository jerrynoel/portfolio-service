import path from 'path';
import mine from 'mime';
import { FileModel } from '../models/FileModel';
import { v4 as uuidv4 } from 'uuid';
import { IAccount } from '@ProjectName/models';

const supportedImages = new Set(['.png', '.jpg', '.jpeg', '.tiff', '.webp', '.svg', '.heif']);
const supportedDocuments = new Set(['.doc', '.docx', '.odt', '.txt', '.pdf', '.xls', '.xlsx', '.ppt', '.pptx']);
const supportedVideos = new Set(['.mp4', '.m4v', '.mov', '.webm', '.mkv', '.avi', '.wmv', ,]);

export type FileType = 'images' | 'documents' | 'videos' | null;
export class FileService {
    getFileExtension(fileName: string) {
        console.log(`getFileExtension for ${fileName} = ${path.extname(fileName)}`);
        return path.extname(fileName);
    }

    getContentType(fileName: string): string | null {
        const fileExtension = this.getFileExtension(fileName);
        if (!fileExtension) {
            return null;
        }
        const filExtensionWithoutDot = fileExtension.split('.')[1];

        return mine.getType(filExtensionWithoutDot);
    }

    isSupportedFile(fileName: string): boolean {
        const fileExtension = this.getFileExtension(fileName);
        return (
            supportedImages.has(fileExtension) ||
            supportedDocuments.has(fileExtension) ||
            supportedVideos.has(fileExtension)
        );
    }

    getFileType(fileName: string): FileType {
        const fileExtension = this.getFileExtension(fileName);
        if (supportedImages.has(fileExtension)) {
            return 'images';
        }
        if (supportedDocuments.has(fileExtension)) {
            return 'documents';
        }

        if (supportedVideos.has(fileExtension)) {
            return 'videos';
        }
        return null;
    }

    isPublicFile(type: FileType) {
        return type === 'images' || type === 'videos';
    }

    getExpireUploadTime(type: FileType): number {
        switch (type) {
            case 'images':
                return Number.parseInt(process.env.EXPIRE_UPLOAD_TIME_IMAGES || '20');
            case 'documents':
                return Number.parseInt(process.env.EXPIRE_UPLOAD_TIME_VIDEOS || '300');
            case 'videos':
                return Number.parseInt(process.env.EXPIRE_UPLOAD_TIME_VIDEOS || '300');
        }
        return 0;
    }

    getUploadFileInfo(currentUserModel: IAccount, data: { fileName: string; fileSize: number }): FileModel {
        const type = this.getFileType(data.fileName);
        const fileId = uuidv4();
        const key = `original/${type}/${currentUserModel.userId}/${fileId}${this.getFileExtension(data.fileName)}`;
        const contentType = this.getContentType(data.fileName);
        const expireUploadTime = this.getExpireUploadTime(type);
        return {
            // TODO: add business id from account
            businessId: '',
            contentType,
            createdUserId: currentUserModel.userId,
            description: '',
            expireUploadTime,
            fileId,
            key,
            originalName: data.fileName,
            public: this.isPublicFile(type),
            size: data.fileSize,
            timestamp: new Date().getTime(),
            type,
        };
    }
}
