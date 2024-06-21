import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { FileResourceService } from '../services/FileResourceService';
import { Auth } from '@ProjectName/middlewares';
import { IAccount } from '@ProjectName/models';
const getFileDetailHandler =
    (dependencies: { fileResourceService: FileResourceService }) => async (event: APIGatewayProxyEvent) => {
        try {
            const id = (event.pathParameters as any).id;

            const fileItem = await dependencies.fileResourceService.getById(id);
            const currentUser = (event as any).user as IAccount;
            if (!fileItem) {
                return {
                    body: JSON.stringify({ message: 'File not found' }),
                    statusCode: 404,
                };
            }

            if (fileItem.createdUserId !== currentUser.userId) {
                return {
                    body: JSON.stringify({
                        message: "You can't view the file details since you are not the owner of the file",
                    }),
                    statusCode: 401,
                };
            }
            const fileDetail = await dependencies.fileResourceService.mapFileDetail(fileItem);

            return {
                body: JSON.stringify(fileDetail),
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

export const handler = middy(getFileDetailHandler({ fileResourceService: new FileResourceService() }))
    .use(Auth())
    .use(httpErrorHandler());
