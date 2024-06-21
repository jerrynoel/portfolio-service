# Portfolio Service
 Portfolio Service - Implementation

---

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Development](#development)
- [Documentation](#documentation)
- [Deployment](#deployment)

# Introduction
 Portfolio Service is one of the microservices implemented to serve platform. 
<br/>

# Getting Started

### Requirements

- AWS CLI configured
- [NodeJS 14.x](https://nodejs.org/en/download/)

# Development

- Code formatter: [Prettier](https://prettier.io/)
- TBA

## Testing

TBA

# Documentation
[1. Set up project](./documents/setup-project.md)
## Upload File architect
![Architect](/documents/upload-file-architect.png "Architect")
The image above explains how a file is uploaded by the user in thes system.
1. User creates the signed upload url function by sending file information to `CreateSignedUploadUrlFunction`. The information can be, mimeType, fileName…
2.  The `CreateSignedUploadUrlFunction` will take file information from the frontend. Do the validation, such as if the user has enough disk space. If the mime type is supported… And then generate the `SignedUploadUrl` to the user.
3. User uses the `SignedUploadUrl` to upload the file on S3.
4. The `SaveUploadFileFunction` will listen to the new file that has been uploaded to S3. And then save the file information into proper place on `DynamoDB`

## API docs

### Postman collection

You can import postman collection [here](./documents-porforlio.postman_collection.json)

Important: You should update the postman variables before testing
![Postman variables](/documents/post-man-variables.png "Postman Variable")

- `access-token` is the id token generate from aws cli


### Upload file to s3 flow
- So to upload file to s3, frontend should post file information `fileName` and `fileSize(in bytes)` to `/api/v1/signed-url`. We have 2 sample requests in the postman collections.
- `Create Signed Url - Images` that will mapped to the [test image](./documents/sample-files/test.jpg).
- `Create Signed Url - Documents` that will mapped to the [sample pdf](./documents/sample-files/sample.pdf).
- After that frontend can use the information that returned from endpoint to upload data.
- You can use the `Upload to S3 By Signed Upload Url` sample endpoint to upload the file to s3. Just specify the file in the form data. 
![File](/documents/document-images/file-in-upload-request.png "Sample File")
### References
https://aws.amazon.com/vi/blogs/compute/uploading-to-amazon-s3-directly-from-a-web-or-mobile-application/

https://leonid.shevtsov.me/post/demystifying-s3-browser-upload/

https://medium.com/@aidan.hallett/securing-aws-s3-uploads-using-presigned-urls-aa821c13ae8d
# Deployment

TBA
