import * as Joi from 'joi';
import { MAXIMUM_UPLOAD_FILE_SIZE } from '../config/config';
import { FileService } from '../services/FileService';

// default is 2024 MB
const fileService = new FileService();
export const UploadFileSchema = Joi.object({
    fileName: Joi.string()
        .required()
        .custom((value, helper) => {
            if (!fileService.isSupportedFile(value)) {
                return helper.error(`The file type for ${value} is not supported yet`);
            }
            return value;
        }),
    fileSize: Joi.number().required().min(1).max(MAXIMUM_UPLOAD_FILE_SIZE),
});
