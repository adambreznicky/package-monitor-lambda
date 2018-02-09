# package-monitor-lambda
NodeJS package.json dependency monitor for AWS Lambda functions to send email notifications when packages are out of date

# NodeJS
Built with:
* NodeJS v8.9.2
* NPM v5.6.0

# Overview
Packaged designed to be used within AWS Lambda NodeJS6.10 Runtime functions. Identify GitHub repositories to monitor and email notification recipients as arguments. The package will identify out of date dependencies within the repo package.json file and email the list of packages with their versions. Personally, it is used within a Lambda function controlled by a fixed rate scheduled Cloudwatch rule. The package does a single inquiry with notification at the time it is being called and does not continually watch the repo, hence the scheduled Cloudwatch call of the Lambda function.

Requires use of  AWS Simple Email Service (SES) for sending the emails which means you will have to configure the Lambda function with the proper role/policy permissions to fire SES and establish a verified email address for SES to utilize. Information on setting up these permissions can be found [here](http://www.wisdomofjim.com/blog/sending-an-email-from-aws-lambda-function-in-nodejs-with-aws-simple-email-service).

# Arguments

# Example
