import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { FileResourceService } from '../services/FileResourceService';
import S3Service from '../services/S3Service';
import { DiskUsageService } from '../services/DiskUsageService';
import { Auth } from '@ProjectName/middlewares';
import { IAccount } from '@ProjectName/models';
import { httpResponse } from '../utils/ResponseUtil';

const deleteFileHandler =
    (dependencies: { diskUsageService: DiskUsageService; fileResourceService: FileResourceService }) =>
    async (event: APIGatewayProxyEvent) => {
        if (event.httpMethod.toUpperCase() === 'OPTIONS') {
            return httpResponse({
                statusCode: 200,
            });
        }

        const id = (event.pathParameters as any).id;
        const currentUser = (event as any).user as IAccount;
        try {
            const fileItem = await dependencies.fileResourceService.getById(id);

            if (!fileItem) {
                return httpResponse({ message: 'File not found' }, 404);
            }

            if (fileItem.createdUserId !== currentUser.userId) {
                return httpResponse(
                    { message: "You can't delete this file since you are not the owner of the file" },
                    401
                );
            }
            await S3Service.deleteFile(fileItem.key);

            console.log(`delete file resource with pk = ${fileItem.pk}, sk = ${fileItem.sk}`);
            await dependencies.fileResourceService.delete(fileItem.pk, fileItem.sk);
            await dependencies.diskUsageService.updateDiskUsage(currentUser, -fileItem.size);

            return httpResponse({ message: 'File is deleted' }, 204);
        } catch (e) {
            console.log('deleteFileHandler exception');
            console.log(e);
            return httpResponse({ message: 'Exception happened during deleting file' }, 500);
        }
    };

export const handler = middy(
    deleteFileHandler({
        diskUsageService: new DiskUsageService(),
        fileResourceService: new FileResourceService(),
    })
)
    .use(Auth())
    .use(httpErrorHandler());
