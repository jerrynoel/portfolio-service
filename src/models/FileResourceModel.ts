import { FileModel } from './FileModel';

export interface FileResourceModel extends FileModel {
    description: string;
    fileId: string;
    pk: string;
    sk: string;
}
