import { IAccount } from '@ProjectName/models';
import AWS from 'aws-sdk';

const ddb = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION || 'us-east-1',
});

const DISK_USAGE_TABLE = process.env.DISK_USAGE_TABLE || 'disk-usage';
export class DiskUsageService {
    private getPrimaryKey(currentUserProfile: { userId: string }) {
        return ['USER', currentUserProfile.userId].join('#');
    }

    async getDiskUsage(currentUserProfile: { userId: string }): Promise<number> {
        const pk = this.getPrimaryKey(currentUserProfile);

        const params = {
            Key: {
                pk,
            },
            TableName: DISK_USAGE_TABLE,
        };

        const diskUsage = await ddb.get(params).promise();

        if (!diskUsage.Item) {
            return 0;
        }

        return diskUsage.Item.diskUsage as number;
    }

    async hasEnoughDisk(currentUserProfile: IAccount, fileSize = 0) {
        const currentUsage = await this.getDiskUsage(currentUserProfile);
        // TODO: check if currentUsage + fileSize > limit
        return true;
    }

    async updateDiskUsage(currentUserProfile: { userId: string }, itemSize: number) {
        const diskUsage = await this.getDiskUsage(currentUserProfile);
        const pk = this.getPrimaryKey(currentUserProfile);
        const newDiskUsage = diskUsage + itemSize > 0 ? diskUsage + itemSize : 0;
        const putParams = {
            Item: {
                diskUsage: newDiskUsage,
                pk,
            },
            TableName: DISK_USAGE_TABLE,
        };
        await ddb.put(putParams as any).promise();
    }
}
