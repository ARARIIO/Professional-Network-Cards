import {
  Controller,
  FileTypeValidator,
  Get,
  Header,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { AVATAR_MAX_BYTES } from './limits.js';
import { StorageService } from './storage.service.js';

type MemoryUpload = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_BYTES },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: AVATAR_MAX_BYTES }),
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/webp)/,
          }),
        ],
      }),
    )
    file: MemoryUpload,
  ): Promise<{ url: string }> {
    const url = await this.storage.uploadAvatar(
      user.id,
      file.buffer,
      file.mimetype,
    );
    return { url };
  }

  @Public()
  @Get('files/avatars/:userId/:name')
  @Header('Cache-Control', 'public, max-age=300')
  @Header('Cross-Origin-Resource-Policy', 'cross-origin')
  async readAvatar(
    @Param('userId') userId: string,
    @Param('name') name: string,
  ): Promise<StreamableFile> {
    const file = await this.storage.readAvatar(userId, name);
    return new StreamableFile(file.bytes, {
      type: file.contentType,
      disposition: 'inline',
    });
  }
}
