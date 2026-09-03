import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { ContactsService } from './contacts.service.js';
import { ImportCsvDto } from './dto/import-csv.dto.js';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="contacts.csv"')
  async export(@CurrentUser() user: AuthUser): Promise<StreamableFile> {
    const csv = await this.contactsService.exportCsv(user.id);
    return new StreamableFile(Buffer.from(csv, 'utf8'));
  }

  @Post('import')
  async importCsv(
    @CurrentUser() user: AuthUser,
    @Body() body: ImportCsvDto,
  ): Promise<{ imported: number }> {
    const imported = await this.contactsService.importCsv(user.id, body.csv);
    return { imported };
  }
}
