import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { FileResourceService } from '../services/FileResourceService';
import { Auth } from '@ProjectName/middlewares';
import { IAccount } from '@ProjectName/models';
const getFilesHandler =
    (dependencies: { fileResourceService: FileResourceService }) => async (event: APIGatewayProxyEvent) => {
        console.log(JSON.stringify(event));

        try {
            const user = (event as any).user as IAccount;

            const query = (event.queryStringParameters || {}) as any;

            const from = query?.from || new Date().getTime();
            const pageSize = query?.pageSize || 50;
            const type = query?.type || 'images';
            const items = await dependencies.fileResourceService.getFiles(user, type, from, pageSize);

            return {
                body: JSON.stringify(items),
                statusCode: 200,
            };
        } catch (err) {
            console.log(err);
            return {
                body: JSON.stringify({
                    message: 'There is a problem happened during getting the file',
                }),
                statusCode: 500,
            };
        }
    };

export const handler = middy(getFilesHandler({ fileResourceService: new FileResourceService() }))
    .use(Auth())
    .use(httpErrorHandler());
