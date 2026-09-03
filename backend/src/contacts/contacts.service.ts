import { HttpStatus, Injectable } from '@nestjs/common';
import type { Contact as ContactRecord } from '../generated/prisma/client.js';
import { parseCsv, toCsvRow } from '../common/csv.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { numberOrNull, stringArrayOrNull, stringOrNull } from '../common/nullish.js';
import { Contact } from './dto/contact.entity.js';
import { SaveContactInput } from './dto/save-contact.input.js';
import { ContactRepository } from './repositories/contact.repository.js';

@Injectable()
export class ContactsService {
  constructor(private readonly contacts: ContactRepository) {}

  toGraphql(record: ContactRecord): Contact {
    const contact = new Contact();
    contact.id = record.id;
    contact.name = record.name;
    contact.email = record.email;
    contact.phone = record.phone;
    contact.website = record.website;
    contact.bio = record.bio;
    contact.skills = record.skills;
    contact.createdAt = record.createdAt;
    return contact;
  }

  countByUserId(userId: string): Promise<number> {
    return this.contacts.countByUserId(userId);
  }

  async save(userId: string, input: SaveContactInput): Promise<Contact> {
    const skills = stringArrayOrNull(input.skills);
    const record = await this.contacts.create({
      userId,
      name: input.name,
      email: stringOrNull(input.email),
      phone: stringOrNull(input.phone),
      website: stringOrNull(input.website),
      bio: stringOrNull(input.bio),
      skills: skills === null ? [] : skills,
      sourceCardId: null,
    });
    return this.toGraphql(record);
  }

  async list(
    userId: string,
    limit: number | null,
    offset: number | null,
  ): Promise<Contact[]> {
    const take = pageLimit(limit);
    const skip = pageOffset(offset);
    const rows = await this.contacts.findByUser(userId, take, skip);
    return rows.map((row) => this.toGraphql(row));
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const existing = await this.contacts.findById(id);
    if (existing === null || existing.userId !== userId) {
      throw new BusinessException('Contact not found', HttpStatus.NOT_FOUND);
    }
    await this.contacts.delete(id);
    return true;
  }

  async exportCsv(userId: string): Promise<string> {
    const rows = await this.contacts.findAllByUser(userId);
    const header = toCsvRow([
      'name',
      'email',
      'phone',
      'website',
      'bio',
      'skills',
    ]);
    const body = rows.map((row) =>
      toCsvRow([
        row.name,
        row.email,
        row.phone,
        row.website,
        row.bio,
        row.skills.join(';'),
      ]),
    );
    return [header, ...body].join('\n');
  }

  async importCsv(userId: string, text: string): Promise<number> {
    const rows = parseCsv(text);
    if (rows.length < 2) {
      throw new BusinessException('CSV must include a header and at least one row');
    }
    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    const nameIndex = header.indexOf('name');
    if (nameIndex < 0) {
      throw new BusinessException('CSV must include a name column');
    }
    let created = 0;
    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      const name = cellAt(row, nameIndex);
      if (name.length === 0) {
        continue;
      }
      await this.contacts.create({
        userId,
        name,
        email: optionalCell(row, header.indexOf('email')),
        phone: optionalCell(row, header.indexOf('phone')),
        website: optionalCell(row, header.indexOf('website')),
        bio: optionalCell(row, header.indexOf('bio')),
        skills: skillsCell(row, header.indexOf('skills')),
        sourceCardId: null,
      });
      created += 1;
    }
    return created;
  }
}

function cellAt(row: string[], index: number): string {
  if (index < 0 || index >= row.length) {
    return '';
  }
  return row[index].trim();
}

function optionalCell(row: string[], index: number): string | null {
  const value = cellAt(row, index);
  return value.length === 0 ? null : value;
}

function skillsCell(row: string[], index: number): string[] {
  const value = cellAt(row, index);
  if (value.length === 0) {
    return [];
  }
  return value
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function pageLimit(limit: number | null): number {
  const value = numberOrNull(limit);
  if (value === null) {
    return 20;
  }
  if (value < 1) {
    return 1;
  }
  if (value > 100) {
    return 100;
  }
  return Math.floor(value);
}

function pageOffset(offset: number | null): number {
  const value = numberOrNull(offset);
  if (value === null || value < 0) {
    return 0;
  }
  return Math.floor(value);
}
