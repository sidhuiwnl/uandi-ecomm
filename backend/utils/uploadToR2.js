const { Upload } = require('@aws-sdk/lib-storage');
const s3Client = require('../config/r2Client');
const path = require('path');


const BUCKET = process.env.R2_BUCKET_NAME;
const R2_BASE_URL = process.env.R2_BASE_URL || `https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev`;


async function uploadStreamToR2(stream, key, contentType) {
if (!key) throw new Error('R2 key required');


const upload = new Upload({
  client: s3Client,
  params: {
  Bucket: BUCKET,
  Key: key,
  Body: stream,
  ContentType: contentType,
  },
  queueSize: 4,
  partSize: 5 * 1024 * 1024, // 5MB
});


const result = await upload.done();
// Public URL builder — adapt if you use custom domain / bucket host
const url = `${R2_BASE_URL}/${encodeURIComponent(key)}`;
return { key, url, etag: result.ETag };
}


// delete object from R2
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

async function deleteFromR2(key) {
  // console.log('Deleting from R2, key:', key);
  const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  // console.log('Delete command:', cmd);
  return s3Client.send(cmd);
}


module.exports = { uploadStreamToR2, deleteFromR2 };