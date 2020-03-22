require('dotenv').config()

const AWS = require('aws-sdk');
aws_access_key_id = process.env["AWS_ACCESS_KEY_ID"]
aws_secret_access_key = process.env["AWS_SECRET_ACCESS_KEY"]
region = process.env["AWS_REGION"]

var S3 = require('aws-sdk/clients/s3');


AWS.config.update({ region });
AWS.config.getCredentials(function (err) {
    if (err) {
        console.log(err.stack)
    }
    // credentials not loaded
    else {
        console.log("Access key:", AWS.config.credentials.accessKeyId);
        console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
    }
});

// Call S3 to list the buckets
console.log(process.env);
s3.listBuckets(function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.Buckets);
    }
});