import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { DiskUsageService } from '../services/DiskUsageService';
import { Auth } from '@ProjectName/middlewares';
import { IAccount } from '@ProjectName/models';
const getDiskUsageHandler =
    (dependencies: { diskUsageService: DiskUsageService }) => async (event: APIGatewayProxyEvent) => {
        const currentUser = (event as any).user as IAccount;

        console.log(`currentUser = ${JSON.stringify(currentUser)}`);
        const diskUsage = await dependencies.diskUsageService.getDiskUsage(currentUser);

        return {
            body: JSON.stringify({
                diskUsage,
            }),
            statusCode: 200,
        };
    };

export const handler = middy(getDiskUsageHandler({ diskUsageService: new DiskUsageService() }))
    .use(Auth())
    .use(httpErrorHandler());
