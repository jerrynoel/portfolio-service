# portfolio-service

This project contains source code and supporting files for a serverless application that you can deploy with the SAM CLI. It includes the following files and folders.

- events - Invocation events that you can use to invoke the function.
- src - Code for the application's Lambda function written in TypeScript.
- template.yaml - A template that defines the application's AWS resources.

The application uses several AWS resources, including Lambda functions, S3 Bucket and an API Gateway API. These resources are defined in the `template.yaml` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit.  
The AWS Toolkit is an open source plug-in for popular IDEs that uses the SAM CLI to build and deploy serverless applications on AWS. The AWS Toolkit also adds a simplified step-through debugging experience for Lambda function code. See the following links to get started.

* [CLion](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [GoLand](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [WebStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [Rider](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [PhpStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [RubyMine](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [DataGrip](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
* [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

## Install dependencies
The project is using private package under the `ProjectName` repositories. The packages prefix is `@ProjectName/...`.
To install the private packages, you should do the following things.
1. Login into the `ProjectName-dev`, we have a sample in `package.json` file, that's is `co:login`.
2. RUN `npm install` to install public dependencies in `package.json`
3. Get the private npm repository url by running below command. Please update to correct domain, profile, and region.
```
aws codeartifact get-repository-endpoint --domain two-global --repository ProjectName --format npm --profile ProjectName-dev --region us-west-2
```
4. Use the `repositoryEndpoint` in previous step to set the npm registry.
```
npm config set registry=https://two-global-788328841071.d.codeartifact.us-west-2.amazonaws.com/npm/ProjectName/
```
5. Install the `ProjectName/middlewares` and `ProjectName/models` by running `npm install --save @ProjectName/middlewares @ProjectName/models`
6. Set back npm publish registry.
```
npm config set registry https://registry.npmjs.com/
```

## Set up AWS profile
You should set up your AWS profile for aws cli. You can check the link [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) 
You can name your profile as ProjectName-dev or anything you like.

## Set up cognito user pool
Since our application will be splitted into many micro services. So we will use the existing Authentication Service. Cognito is the Amazon Authentication Service. It is easy to integrate with AWS stack. So we use it for ProjectName.
In your AWS account, go to Cognito service and create your own pool with basic settings. You can have a basic example, and how to get Access Token from cognito user pool [here](https://stackoverflow.com/questions/52287506/how-do-i-integrate-amazon-cognito-login-in-postman)
Cognito user pool for ProjectName application can be retrieved from environment SSM


## Set up SSM environment variables
In AWS System Manager, choose `Parameter Store` to update environment variables.
![SSM](./ssm.png "SSM")

Here are the list of required variables:
- `COGNITO_USER_POOL_ARN`: USER POOL ARN used by all ProjectName services.
- `COGNITO_USER_POOL_ID`: USER POOL ID
- `COGNITO_USER_POOL_REGION`: USER POOL Region, for example us-east-2


## Deploy the application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 14](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided --profile ProjectName-dev
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.
* **Stage**: The stage of application, it can be dev, staging or prod
* **AWS Region**: The AWS region you want to deploy your app to.
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
* **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
* **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

You can find your API Gateway Endpoint URL in the output values displayed after deployment.

## Use the SAM CLI to build and test locally

Build your application with the `sam build` command.

```bash
sam build
```

The SAM CLI installs dependencies defined in `src/package.json`, compiles TypeScript with esbuild, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
sam local invoke "CreateSignedUploadUrlFunction" -e events/event-send-business-request.json --profile [your-profile]
```

The SAM CLI can also emulate your application's API. Use the `sam local start-api` to run the API locally on port 3001. Or run `sam local start-api -p PORT` to run a custom port.

```bash
sam local start-api
curl http://localhost:3000/
```

The SAM CLI reads the application template to determine the API's routes and the functions that they invoke. The `Events` property on each function's definition includes the route and method for each path.

```yaml
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

## Add a resource to your application
The application template uses AWS Serverless Application Model (AWS SAM) to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources such as functions, triggers, and APIs. For resources not included in [the SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use standard [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) resource types.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

```bash
user-activity-service$ sam logs -n HelloWorldFunction --stack-name user-activity-service --tail
```

You can find more information and examples about filtering Lambda function logs in the [SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `src/tests` folder in this project. Use NPM to install the [Jest test framework](https://jestjs.io/) and run unit tests.

```bash
cd src
src$ npm install
src$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name user-activity-service
```

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)
