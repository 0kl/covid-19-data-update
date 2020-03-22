// dependencies
var AWS = require('aws-sdk');
var util = require('util');

// get reference to S3 client
AWS.config.update({
    region:
        "us-east-2"
});

var s3 = new AWS.S3();

exports.handler = function (file) {

    // Create S3 service object
    s3 = new AWS.S3({ apiVersion: '2006-03-01' });

    // call S3 to retrieve upload file to specified bucket
    var uploadParams = { Bucket: "covid19databackup", Key: '', Body: '' };
    var file = process.argv[3];

    // Configure the file stream and obtain the upload parameters
    var fs = require('fs');
    var fileStream = fs.createReadStream(file);
    fileStream.on('error', function (err) {
        console.log('File Error', err);
    });
    uploadParams.Body = fileStream;
    var path = require('path');
    uploadParams.Key = path.basename(Date.now() + file);

    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, function (err, data) {
        if (err) {
            console.log("Error", err);
        } if (data) {
            console.log("Upload Success", data.Location);
        }
    });
};

var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'REGION' });

// Create S3 service object
s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Create the parameters for calling listObjects
var bucketParams = {
    Bucket: 'BUCKET_NAME',
};

// Call S3 to obtain a list of the objects in the bucket
s3.listObjects(bucketParams, function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data);
    }
});