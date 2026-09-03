import { env, envOr } from '../common/env.js';

export type S3RuntimeConfig = {
  endpoint: string | null;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  publicUrl: string;
};

export function s3RuntimeConfig(): S3RuntimeConfig {
  const endpoint = envOr('S3_ENDPOINT', '');
  return {
    endpoint: endpoint.length === 0 ? null : endpoint,
    region: env('S3_REGION'),
    accessKey: env('S3_ACCESS_KEY'),
    secretKey: env('S3_SECRET_KEY'),
    bucket: env('S3_BUCKET'),
    publicUrl: env('S3_PUBLIC_URL'),
  };
}
