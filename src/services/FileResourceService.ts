import AWS from 'aws-sdk';
import { FileResourceModel } from '../models/FileResourceModel';
import { FileModel } from '../models/FileModel';
import { FileType } from './FileService';
import S3Service from './S3Service';
import { FileDetailModel } from '../models/FileDetailModel';
import { IAccount } from '@ProjectName/models';

const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

export class FileResourceService {
    public static get FILE_RESOURCE_TABLE(): string {
        return process.env.FILE_RESOURCE_TABLE || 'file-resource';
    }

    public static get FILE_ID_INDEX(): string {
        return process.env.FILE_ID_INDEX || 'file-id-index';
    }

    private getPrimaryKey(data: { userId: string }, type: FileType) {
        return ['USER', data.userId, type].join('#');
    }

    private getSortKey(data: { timestamp?: number }) {
        return ['SK', data.timestamp].join('#');
    }

    async save(data: FileModel) {
        const pk = this.getPrimaryKey({ userId: data.createdUserId }, data.type);
        const sk = this.getSortKey(data);
        const putItem: FileResourceModel = { ...data, description: '', pk, sk };

        const putParams = {
            Item: putItem,
            TableName: FileResourceService.FILE_RESOURCE_TABLE,
        };

        console.log('save upload request');
        console.log(putParams);
        await ddb.put(putParams as any).promise();
    }

    async getById(fileId: string): Promise<FileResourceModel | null> {
        const expressionValues = {
            ':fileId': fileId,
        };
        const queryOut = await ddb
            .query({
                ExpressionAttributeValues: expressionValues,
                IndexName: FileResourceService.FILE_ID_INDEX,
                KeyConditionExpression: 'fileId = :fileId',
                Limit: 1,
                TableName: FileResourceService.FILE_RESOURCE_TABLE,
            })
            .promise();
        if (!queryOut.Items?.length) {
            return null;
        }

        return queryOut.Items[0] as FileResourceModel;
    }

    async update(pk: string, sk: string, description = '') {
        try {
            await ddb
                .update({
                    ExpressionAttributeValues: {
                        ':description': description,
                    },
                    Key: {
                        pk,
                        sk,
                    },
                    TableName: FileResourceService.FILE_RESOURCE_TABLE,
                    UpdateExpression: 'set description = :description',
                })
                .promise();
        } catch (e) {
            console.log(`exception during delete file resource, pk = ${pk}, sk = ${sk}`);
            console.log(e);
            throw e;
        }
    }

    async delete(pk: string, sk: string) {
        try {
            await ddb
                .delete({
                    Key: {
                        pk,
                        sk,
                    },
                    TableName: FileResourceService.FILE_RESOURCE_TABLE,
                })
                .promise();
        } catch (e) {
            console.log(`exception during delete file resource, pk = ${pk}, sk = ${sk}`);
            console.log(e);
            throw e;
        }
    }

    async getFiles(profile: IAccount, type: FileType = 'images', from: number, pageSize: 50) {
        const pk = this.getPrimaryKey(profile, type);
        const sk = this.getSortKey({ timestamp: from });
        const queryOut = await ddb
            .query({
                ExpressionAttributeValues: {
                    ':pk': pk,
                    ':sk': sk,
                },
                KeyConditionExpression: 'pk = :pk and sk <= :sk',
                Limit: pageSize,
                ScanIndexForward: false, // true = ascending, false = descending
                TableName: FileResourceService.FILE_RESOURCE_TABLE,
            })
            .promise();

        const items = queryOut.Items as FileResourceModel[];

        const results = [];

        for (const item of items) {
            const mappedItem = await this.mapFileDetail(item);
            results.push(mappedItem);
        }

        return results;
    }

    async mapFileDetail(fileItem: FileResourceModel) {
        const s3Info = await S3Service.getDownloadUrl(fileItem.key, fileItem.public);
        console.log(s3Info);
        const fileDetail: FileDetailModel = {
            description: fileItem.description,
            downloadUrl: s3Info.url,
            expiredTime: s3Info.expired,
            fileName: fileItem.originalName,
            height: fileItem.height,
            id: fileItem.fileId,
            size: fileItem.size,
            timestamp: fileItem.timestamp,
            type: fileItem.type,
            width: fileItem.width,
        };

        return fileDetail;
    }
}
