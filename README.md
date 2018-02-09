# package-monitor-lambda
NodeJS package.json dependency monitor for AWS Lambda functions to send email notifications when packages are out of date

# NodeJS
Built with:
* NodeJS v8.9.2
* NPM v5.6.0

# Overview
Packaged designed to be used within AWS Lambda NodeJS6.10 Runtime functions. Identify GitHub repositories to monitor, email notification recipients, AWS region, and From (source) email as arguments. The package will identify out of date dependencies within the repo package.json file and email the list of packages with their versions. Personally, it is used within a Lambda function controlled by a fixed rate scheduled Cloudwatch rule. The package does a single inquiry with notification at the time it is being called and does not continually watch the repo, hence the scheduled Cloudwatch call of the Lambda function.

Requires use of  AWS Simple Email Service (SES) for sending the emails which means you will have to configure the Lambda function with the proper role/policy permissions to fire SES and establish a verified email address for SES to utilize. Information on setting up these permissions can be found [here](http://www.wisdomofjim.com/blog/sending-an-email-from-aws-lambda-function-in-nodejs-with-aws-simple-email-service).

# Setup
Install the package in your project: `npm install package-monitor-lambda --save`

Require within the application code:
``` javascript
var pml = require('package-monitor-lambda');
```

# Example
Use within the application:
``` javascript
var pml = require('package-monitor-lambda');

var repos = [
  {
    owner: 'adambreznicky',
    name: 'jerryshotrods',
    subdirectory: ''
  },
  {
    owner: 'TNRIS',
    name: 'data-download',
    subdirectory: 'application'
  }
];
var recipients = ['recieverEmail@domain.com'];
var region = 'us-east-1';
var source = 'sesVerified@domain.com';

pml.monitor(repos, recipients, region, source);
```

# Arguments
Four required arguments: `pml.monitor(repos, recipients, region, source);`
* **repos** - the application repositories you wish to check the dependecies of.
  * Must be an **Array** of **Objects**
  * Each Object must have the `owner`, `name`, and `subdirectory` keys
  * `owner` is the repo owner as a string. will be an individual or organization.
  * `name` is the repo name as a string.
  * `subdirectory` is the subfolder path the 'package.json' file resides in if it is not in the base of the project. If it is in the base, this should equal an empty sting (like `''`). If the 'package.json' is nested, provide the path to the directory using only forward slashes between each directory step. For example, if 'package.son' is in `<base>/src/app` use `'src/app'`, or if it is in `<base>/app` use `'app'`
* **recipients** - array of email strings who will notified of the available package updates
  * Must be an **Array**
* **region** - the AWS region where the Lambda & SES reside, such as 'us-east-1'
  * Must be a **string**
* **source** - the AWS SES verified email address to send the notification from
  * Must be a **string**

### Notice
This package serves a very specific use case. Would be more globally applicable if split into 2 packages:
1. Repo package identifier to return properly formatted available updates
2. AWS SES Emailer to feed the return from step 1
