import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  s3: {
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
  },
  cloudfront: {
    url: process.env.CLOUDFRONT_URL,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
  },
}));
