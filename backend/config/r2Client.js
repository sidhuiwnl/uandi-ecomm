const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Cloudflare R2 uses an endpoint of https://<ACCOUNT_ID>.r2.cloudflarestorage.com
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const endpoint = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: 'auto', // R2 ignores region but some SDKs require a value
  endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  },
  forcePathStyle: false
});

module.exports = s3Client;
