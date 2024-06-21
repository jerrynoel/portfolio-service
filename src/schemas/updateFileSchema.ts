import * as Joi from 'joi';

// default is 2024 MB
export const UpdateFileSchema = Joi.object({
    description: Joi.string().optional(),
});
