import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import { UploadFileSchema } from '../schemas/uploadFileSchema';
import { FileService } from '../services/FileService';
import S3Service from '../services/S3Service';
import { DiskUsageService } from '../services/DiskUsageService';
import { UploadRequestService } from '../services/UploadRequestService';
import { httpResponse } from '../utils/ResponseUtil';
import { Auth } from '@ProjectName/middlewares';
import { IAccount } from '@ProjectName/models';

const createSignedUploadUrlHandler =
    (dependencies: {
        diskUsageService: DiskUsageService;
        fileService: FileService;
        uploadRequestService: UploadRequestService;
    }) =>
    async (event: APIGatewayProxyEvent) => {
        if (event.httpMethod.toUpperCase() === 'OPTIONS') {
            return httpResponse(
                {
                    statusCode: 200,
                },
                200
            );
        }

        const validateResult = UploadFileSchema.validate(event.body);

        if (validateResult.error) {
            return httpResponse(validateResult.error, 400);
        }

        const body = event.body as any as { fileName: string; fileSize: number };
        const currentUser = (event as any).user as IAccount;

        const hasEnoughDisk = await dependencies.diskUsageService.hasEnoughDisk(currentUser, body.fileSize);

        if (!hasEnoughDisk) {
            return httpResponse({ message: "You don't have enough disk space left" }, 400);
        }

        const file = dependencies.fileService.getUploadFileInfo(currentUser, {
            fileName: body.fileName,
            fileSize: body.fileSize,
        });

        console.log(`file info = ${JSON.stringify(file)}`);
        const uploadData = await S3Service.getSignedUploadUrl(file);
        await dependencies.uploadRequestService.save(file);

        return httpResponse(uploadData, 201);
    };

export const handler = middy(
    createSignedUploadUrlHandler({
        diskUsageService: new DiskUsageService(),
        fileService: new FileService(),
        uploadRequestService: new UploadRequestService(),
    })
)
    .use(jsonBodyParser())
    .use(Auth())
    .use(httpErrorHandler());
