import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import { UpdateFileSchema } from '../schemas/updateFileSchema';
import { FileResourceService } from '../services/FileResourceService';
import { Auth } from '@ProjectName/middlewares';
import { IAccount } from '@ProjectName/models';

const updateFileHandler =
    (dependencies: { fileResourceService: FileResourceService }) => async (event: APIGatewayProxyEvent) => {
        console.log(JSON.stringify(event));

        const validateResult = UpdateFileSchema.validate(event.body);

        if (validateResult.error) {
            return {
                body: JSON.stringify(validateResult.error),
                statusCode: 400,
            };
        }

        const id = (event.pathParameters as any).id;

        const body = event.body as any as { description: string };
        const currentUser = (event as any).user as IAccount;

        try {
            const fileItem = await dependencies.fileResourceService.getById(id);

            if (!fileItem) {
                return {
                    body: JSON.stringify({ message: 'File not found' }),
                    statusCode: 404,
                };
            }
            if (fileItem.createdUserId !== currentUser.userId) {
                return {
                    body: JSON.stringify({
                        message: "You can't update this file since you are not the owner of the file",
                    }),
                    statusCode: 401,
                };
            }
            await dependencies.fileResourceService.update(fileItem.pk, fileItem.sk, body.description);
            return {
                body: JSON.stringify({
                    message: 'File is updated!',
                }),
                statusCode: 200,
            };
        } catch (e) {
            console.log('deleteFileHandler exception');
            console.log(e);
            return {
                body: JSON.stringify({
                    message: 'Exception happened during deleting file',
                }),
                statusCode: 500,
            };
        }
    };

export const handler = middy(
    updateFileHandler({
        fileResourceService: new FileResourceService(),
    })
)
    .use(jsonBodyParser())
    .use(Auth())
    .use(httpErrorHandler());
