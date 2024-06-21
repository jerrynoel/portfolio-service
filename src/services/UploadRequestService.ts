import AWS from 'aws-sdk';
import { FileModel } from '../models/FileModel';

const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

export class UploadRequestService {
    public static get UPLOAD_REQUEST_TABLE(): string {
        return process.env.UPLOAD_REQUEST_TABLE || 'upload-request-table';
    }
    private getPrimaryKey(key: string) {
        return key;
    }

    async save(data: FileModel) {
        const pk = this.getPrimaryKey(data.key);
        const putParams = {
            Item: {
                ...data,
                pk,
            },
            TableName: UploadRequestService.UPLOAD_REQUEST_TABLE,
        };

        console.log('save upload request');
        console.log(putParams);
        await ddb.put(putParams as any).promise();
    }

    async getByPrimaryKey(key: string): Promise<FileModel | null> {
        const pk = this.getPrimaryKey(key);
        const params = {
            Key: {
                pk,
            },
            TableName: UploadRequestService.UPLOAD_REQUEST_TABLE,
        };

        const requestInfo = await ddb.get(params).promise();

        if (!requestInfo.Item) {
            return null;
        }

        return requestInfo.Item as FileModel;
    }
}
