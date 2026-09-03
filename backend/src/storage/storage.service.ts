import { HttpStatus, Injectable } from '@nestjs/common';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { s3RuntimeConfig } from '../config/storage.config.js';
import {
  avatarObjectKey,
  avatarObjectKeyFromUrl,
  avatarPrefix,
  isAvatarFileName,
  isAvatarUserId,
  servedAvatarUrl,
} from './avatar-key.js';
import { AVATAR_MAX_BYTES } from './limits.js';
import { extensionForMime } from './mime.js';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    const config = s3RuntimeConfig();
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl.replace(/\/$/, '');
    if (config.endpoint === null) {
      this.client = new S3Client({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKey,
          secretAccessKey: config.secretKey,
        },
      });
    } else {
      this.client = new S3Client({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKey,
          secretAccessKey: config.secretKey,
        },
        endpoint: config.endpoint,
        forcePathStyle: true,
      });
    }
  }

  async uploadAvatar(
    userId: string,
    body: Buffer,
    mimetype: string,
  ): Promise<string> {
    if (body.length === 0 || body.length > AVATAR_MAX_BYTES) {
      throw new BusinessException('Image must be between 1 byte and 50 MB');
    }
    const ext = extensionForMime(mimetype);
    if (ext === null) {
      throw new BusinessException('Use JPEG, PNG, or WebP');
    }
    const fileName = `${nanoid(16)}.${ext}`;
    const key = avatarObjectKey(userId, fileName);
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: mimetype,
        }),
      );
    } catch {
      throw new BusinessException('Unable to store file', HttpStatus.BAD_GATEWAY);
    }
    await this.deleteUserAvatars(userId, key);
    return `${this.publicUrl}/${key}`;
  }

  servedUrl(stored: string | null): string | null {
    return servedAvatarUrl(this.publicUrl, stored);
  }

  async deleteByPublicUrl(fileUrl: string): Promise<void> {
    const key = avatarObjectKeyFromUrl(fileUrl);
    if (key === null) {
      return;
    }
    await this.deleteKeys(key);
  }

  async deleteUserAvatars(userId: string, keepKey: string | null = null): Promise<void> {
    if (isAvatarUserId(userId) === false) {
      return;
    }
    try {
      const keys = await this.listUserAvatarKeys(userId);
      const stale = keys.filter((entry) => entry !== keepKey);
      await this.deleteKeys(...stale);
    } catch {
      return;
    }
  }

  async readAvatar(
    userId: string,
    fileName: string,
  ): Promise<{ bytes: Buffer; contentType: string }> {
    if (isAvatarUserId(userId) === false || isAvatarFileName(fileName) === false) {
      throw new BusinessException('File not found', HttpStatus.NOT_FOUND);
    }
    const key = avatarObjectKey(userId, fileName);
    try {
      const object = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      const body = object.Body;
      if (body === null || typeof body !== 'object') {
        throw new BusinessException('File not found', HttpStatus.NOT_FOUND);
      }
      if ('transformToByteArray' in body === false) {
        throw new BusinessException('File not found', HttpStatus.NOT_FOUND);
      }
      const transform = body.transformToByteArray;
      if (typeof transform !== 'function') {
        throw new BusinessException('File not found', HttpStatus.NOT_FOUND);
      }
      const bytes = Buffer.from(await transform.call(body));
      const contentType =
        typeof object.ContentType === 'string' ? object.ContentType : 'image/jpeg';
      return { bytes, contentType };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('File not found', HttpStatus.NOT_FOUND);
    }
  }

  private async listUserAvatarKeys(userId: string): Promise<string[]> {
    const prefix = avatarPrefix(userId);
    const keys: string[] = [];
    let token: string | null = null;
    for (;;) {
      const listed: ListObjectsV2CommandOutput = await this.listAvatarPage(
        prefix,
        token,
      );
      const contents = listed.Contents;
      if (Array.isArray(contents)) {
        for (const item of contents) {
          if (typeof item.Key === 'string' && item.Key.length > 0) {
            keys.push(item.Key);
          }
        }
      }
      if (listed.IsTruncated === true && typeof listed.NextContinuationToken === 'string') {
        token = listed.NextContinuationToken;
        continue;
      }
      return keys;
    }
  }

  private listAvatarPage(
    prefix: string,
    token: string | null,
  ): Promise<ListObjectsV2CommandOutput> {
    if (token === null) {
      return this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
        }),
      );
    }
    return this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
  }

  private async deleteKeys(...keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    const chunkSize = 1000;
    for (let offset = 0; offset < keys.length; offset += chunkSize) {
      const chunk = keys.slice(offset, offset + chunkSize);
      try {
        await this.client.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
              Objects: chunk.map((Key) => ({ Key })),
              Quiet: true,
            },
          }),
        );
      } catch {
        return;
      }
    }
  }
}
