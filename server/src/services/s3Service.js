import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';

const BUCKET = process.env.AWS_S3_BUCKET;

let _client = null;

const getClient = () => {
  if (!_client) {
    _client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
};

export const isS3Configured = () =>
  !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET);

/**
 * Upload a local file to S3. Returns the S3 object key.
 */
export const uploadToS3 = async (filePath, fileName, userId) => {
  const key = `uploads/${userId}/${Date.now()}-${fileName}`;
  const fileStream = fs.createReadStream(filePath);

  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileStream,
    })
  );

  return key;
};

/**
 * Delete an object from S3 by its key.
 */
export const deleteFromS3 = async (s3Key) => {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
    })
  );
};

/**
 * Generate a pre-signed URL for downloading a private S3 object.
 * Default expiry: 1 hour.
 */
export const getSignedDownloadUrl = async (s3Key, expiresIn = 3600) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key });
  return getSignedUrl(getClient(), command, { expiresIn });
};
