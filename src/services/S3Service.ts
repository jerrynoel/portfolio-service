import * as AWS from 'aws-sdk';
import { MAXIMUM_UPLOAD_FILE_SIZE } from '../config/config';
const s3 = new AWS.S3();
import { FileModel } from '../models/FileModel';
class S3Service {
    public static get FILE_RESOURCE_BUCKET_NAME(): string {
        return process.env.FILE_RESOURCE_BUCKET_NAME || 'file-resource';
    }
    async getSignedUploadUrl(fileData: FileModel): Promise<any> {
        // Check docs here:
        // https://leonid.shevtsov.me/post/demystifying-s3-browser-upload/
        const acl = fileData.public ? 'public-read' : 'private';

        const s3Params = {
            Bucket: S3Service.FILE_RESOURCE_BUCKET_NAME,
            Conditions: [
                // { 'Content-Type': fileData.contentType },
                ['content-length-range', 0, MAXIMUM_UPLOAD_FILE_SIZE], // restrict file size
                { acl: acl },
            ],
            Expires: fileData.expireUploadTime,
            Fields: { Key: fileData.key, success_action_status: '201' },
        };

        console.log('Params: ', s3Params);
        const uploadData = await s3.createPresignedPost(s3Params);

        return { fields: { ...uploadData.fields, acl }, url: uploadData.url };
    }

    async getFilePublicUrl(key: string) {
        return `https://${S3Service.FILE_RESOURCE_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    async getDownloadUrl(key: string, isPublicRead = false) {
        try {
            if (isPublicRead) {
                return { expired: null, url: `https://${S3Service.FILE_RESOURCE_BUCKET_NAME}.s3.amazonaws.com/${key}` };
            }
            const currentTime = new Date().getTime();
            const expiresIn = Number.parseInt(process.env.DOWNLOAD_URL_EXPIRES_TIME || '300');
            const params = {
                Bucket: S3Service.FILE_RESOURCE_BUCKET_NAME,
                Expires: expiresIn,
                Key: key,
            };
            const url = await s3.getSignedUrl('getObject', params);
            return { expired: currentTime + expiresIn * 1000, url };
        } catch (e) {
            console.log('error while getDownloadUrl');
            console.log(e);
            throw e;
        }
    }

    async deleteFile(Key: string) {
        const params = { Bucket: S3Service.FILE_RESOURCE_BUCKET_NAME, Key };
        try {
            await s3.deleteObject(params).promise();
        } catch (e) {
            console.log('error while deleting s3 object');
            console.log(e);
            throw e;
        }
    }
}

const s3Service = new S3Service();

export default s3Service;
