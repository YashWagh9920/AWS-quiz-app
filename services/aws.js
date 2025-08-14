require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create DynamoDB document client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Create S3 client
const s3 = new AWS.S3();

module.exports = {
  dynamoDB,
  s3
};