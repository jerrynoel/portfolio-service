import { S3CreateEvent } from 'aws-lambda';
import { DiskUsageService } from '../services/DiskUsageService';
import { FileResourceService } from '../services/FileResourceService';
import imageService from '../services/ImageService';
import s3Service from '../services/S3Service';
import { UploadRequestService } from '../services/UploadRequestService';

const saveUploadedFileHandler =
    (dependencies: {
        diskUsageService: DiskUsageService;
        fileResourceService: FileResourceService;
        uploadRequestService: UploadRequestService;
    }) =>
    async (event: S3CreateEvent) => {
        for (const record of event.Records) {
            const newS3Object = record.s3.object;
            const uploadRequest = await dependencies.uploadRequestService.getByPrimaryKey(newS3Object.key);

            if (!uploadRequest) {
                console.log('original upload request not found');
                continue;
            }
            console.log(uploadRequest);

            if (uploadRequest.type === 'images') {
                const info = await s3Service.getDownloadUrl(newS3Object.key, true);
                const imageDimension = await imageService.getSize(info.url);
                uploadRequest.height = imageDimension.height;
                uploadRequest.width = imageDimension.width;
            }
            await dependencies.fileResourceService.save({ ...uploadRequest, size: newS3Object.size });
            await dependencies.diskUsageService.updateDiskUsage(
                { userId: uploadRequest.createdUserId },
                newS3Object.size
            );
        }
    };

export const handler = saveUploadedFileHandler({
    diskUsageService: new DiskUsageService(),
    fileResourceService: new FileResourceService(),
    uploadRequestService: new UploadRequestService(),
});
