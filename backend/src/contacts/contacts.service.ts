import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import type { Card as CardRecord, Contact as ContactRecord } from '../generated/prisma/client.js';
import { parseCsv, toCsvRow } from '../common/csv.js';
import { normalizeEmail } from '../common/email.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { numberOrNull, stringArrayOrNull, stringOrNull } from '../common/nullish.js';
import { CardRepository } from '../cards/repositories/card.repository.js';
import { Contact } from './dto/contact.entity.js';
import { ContactInvite } from './dto/contact-invite.entity.js';
import { SaveContactInput } from './dto/save-contact.input.js';
import { ContactInviteRepository } from './repositories/contact-invite.repository.js';
import type { InviteWithPeople } from './repositories/contact-invite.repository.js';
import { ContactRepository } from './repositories/contact.repository.js';

@Injectable()
export class ContactsService {
  constructor(
    private readonly contacts: ContactRepository,
    private readonly invites: ContactInviteRepository,
    @Inject(forwardRef(() => CardRepository))
    private readonly cards: CardRepository,
  ) {}

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

  toInvite(record: InviteWithPeople): ContactInvite {
    const invite = new ContactInvite();
    invite.id = record.id;
    invite.status = record.status;
    invite.fromName = record.fromUser.name;
    invite.fromEmail = record.fromUser.email;
    invite.cardName = record.sourceCard.name;
    invite.cardSlug = record.sourceCard.slug;
    invite.createdAt = record.createdAt;
    return invite;
  }

  countByUserId(userId: string): Promise<number> {
    return this.contacts.countByUserId(userId);
  }

  countBySourceCardId(sourceCardId: string): Promise<number> {
    return this.contacts.countBySourceCardId(sourceCardId);
  }

  async save(userId: string, input: SaveContactInput): Promise<Contact> {
    const sourceSlug = stringOrNull(input.sourceSlug);
    if (sourceSlug !== null) {
      throw new BusinessException(
        'Request permission with sendContactInvite',
        HttpStatus.BAD_REQUEST,
      );
    }
    const email = normalizeEmail(stringOrNull(input.email));
    if (email !== null) {
      const byEmail = await this.contacts.findByUserAndEmail(userId, email);
      if (byEmail !== null) {
        return this.toGraphql(byEmail);
      }
    }
    const skills = stringArrayOrNull(input.skills);
    const record = await this.contacts.create({
      userId,
      name: input.name,
      email,
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
      const email = normalizeEmail(optionalCell(row, header.indexOf('email')));
      if (email !== null) {
        const existing = await this.contacts.findByUserAndEmail(userId, email);
        if (existing !== null) {
          continue;
        }
      }
      await this.contacts.create({
        userId,
        name,
        email,
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

  incomingInvites(userId: string): Promise<ContactInvite[]> {
    return this.invites.findIncomingPending(userId).then((rows) => rows.map((row) => this.toInvite(row)));
  }

  outgoingInvites(userId: string): Promise<ContactInvite[]> {
    return this.invites.findOutgoing(userId).then((rows) => rows.map((row) => this.toInvite(row)));
  }

  async inviteStatusByCardIds(
    fromUserId: string,
    cardIds: string[],
  ): Promise<Map<string, string>> {
    const rows = await this.invites.findByFromAndCards(fromUserId, cardIds);
    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(row.sourceCardId, row.status);
    }
    return map;
  }

  async sendInvite(userId: string, rawSlug: string): Promise<ContactInvite> {
    const source = await this.requirePublicForeignCard(userId, rawSlug);
    const existing = await this.invites.findByFromAndCard(userId, source.id);
    if (existing !== null) {
      if (existing.status === 'accepted') {
        return this.toInvite(existing);
      }
      if (existing.status === 'pending') {
        return this.toInvite(existing);
      }
      const reopened = await this.invites.updateStatus(existing.id, 'pending', null);
      return this.toInvite(reopened);
    }
    const created = await this.invites.create({
      fromUserId: userId,
      toUserId: source.userId,
      sourceCardId: source.id,
    });
    return this.toInvite(created);
  }

  async respondInvite(userId: string, inviteId: string, accept: boolean): Promise<ContactInvite> {
    const existing = await this.invites.findById(inviteId);
    if (existing === null || existing.toUserId !== userId) {
      throw new BusinessException('Invite not found', HttpStatus.NOT_FOUND);
    }
    if (existing.status !== 'pending') {
      return this.toInvite(existing);
    }
    if (accept === false) {
      const declined = await this.invites.updateStatus(existing.id, 'declined', new Date());
      return this.toInvite(declined);
    }
    await this.saveFromCard(existing.fromUserId, existing.sourceCard);
    const requesterCard = await this.cards.findByUserId(existing.fromUserId);
    if (requesterCard !== null && requesterCard.isPublic) {
      await this.saveFromCard(existing.toUserId, requesterCard);
    }
    const accepted = await this.invites.updateStatus(existing.id, 'accepted', new Date());
    return this.toInvite(accepted);
  }

  private async saveFromCard(userId: string, source: CardRecord): Promise<Contact> {
    const snapshot = {
      name: source.name,
      email: normalizeEmail(source.email),
      phone: source.phone,
      website: source.website,
      bio: source.bio,
      skills: source.skills,
      sourceCardId: source.id,
    };
    const existing = await this.contacts.findByUserAndSource(userId, source.id);
    if (existing !== null) {
      const updated = await this.contacts.update(existing.id, snapshot);
      return this.toGraphql(updated);
    }
    try {
      const created = await this.contacts.create({
        userId,
        ...snapshot,
      });
      return this.toGraphql(created);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        const raced = await this.contacts.findByUserAndSource(userId, source.id);
        if (raced !== null) {
          return this.toGraphql(raced);
        }
      }
      throw new BusinessException('Unable to save contact');
    }
  }

  private async requirePublicForeignCard(
    userId: string,
    rawSlug: string,
  ): Promise<CardRecord> {
    const slug = stringOrNull(rawSlug);
    if (slug === null) {
      throw new BusinessException('Card not found', HttpStatus.NOT_FOUND);
    }
    const card = await this.cards.findBySlug(slug);
    if (card === null || card.isPublic === false) {
      throw new BusinessException('Card not found', HttpStatus.NOT_FOUND);
    }
    if (card.userId === userId) {
      throw new BusinessException('Cannot invite your own card', HttpStatus.BAD_REQUEST);
    }
    return card;
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
