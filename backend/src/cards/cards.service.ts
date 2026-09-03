import { HttpStatus, Injectable } from '@nestjs/common';
import type { Card as CardRecord, Prisma } from '../generated/prisma/client.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import {
  booleanOrNull,
  stringArrayOrNull,
  stringOrNull,
} from '../common/nullish.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateCardInput } from './dto/create-card.input.js';
import { UpdateCardInput } from './dto/update-card.input.js';
import { Card } from './entities/card.entity.js';
import { PublicCard } from './entities/public-card.entity.js';
import { CardRepository } from './repositories/card.repository.js';
import { NanoidSlugGenerator } from './strategies/slug-generator.strategy.js';

const SLUG_ATTEMPTS = 5;

@Injectable()
export class CardsService {
  constructor(
    private readonly cards: CardRepository,
    private readonly slugs: NanoidSlugGenerator,
    private readonly analytics: AnalyticsService,
    private readonly storage: StorageService,
  ) {}

  async toGraphql(record: CardRecord): Promise<Card> {
    const card = new Card();
    card.id = record.id;
    card.userId = record.userId;
    card.name = record.name;
    card.role = record.role;
    card.email = record.email;
    card.phone = record.phone;
    card.website = record.website;
    card.bio = record.bio;
    card.skills = record.skills;
    card.avatarUrl = record.avatarUrl;
    card.backgroundColor = record.backgroundColor;
    card.linkedin = record.linkedin;
    card.github = record.github;
    card.twitter = record.twitter;
    card.slug = record.slug;
    card.isPublic = record.isPublic;
    card.viewsCount = record.viewsCount;
    card.createdAt = record.createdAt;
    card.updatedAt = record.updatedAt;
    return card;
  }

  toPublic(record: CardRecord): PublicCard {
    const card = new PublicCard();
    card.name = record.name;
    card.role = record.role;
    card.email = record.email;
    card.phone = record.phone;
    card.website = record.website;
    card.bio = record.bio;
    card.skills = record.skills;
    card.avatarUrl = record.avatarUrl;
    card.backgroundColor = record.backgroundColor;
    card.linkedin = record.linkedin;
    card.github = record.github;
    card.twitter = record.twitter;
    return card;
  }

  async findGraphqlByUserId(userId: string): Promise<Card | null> {
    const record = await this.cards.findByUserId(userId);
    if (record === null) {
      return null;
    }
    return this.toGraphql(record);
  }

  async myCard(userId: string): Promise<Card | null> {
    return this.findGraphqlByUserId(userId);
  }

  async create(userId: string, input: CreateCardInput): Promise<Card> {
    const existing = await this.cards.findByUserId(userId);
    if (existing !== null) {
      throw new BusinessException('Card already exists', HttpStatus.CONFLICT);
    }
    const skills = stringArrayOrNull(input.skills);
    const color = stringOrNull(input.backgroundColor);
    const published = booleanOrNull(input.isPublic);
    const data = {
      userId,
      name: input.name,
      role: stringOrNull(input.role),
      email: input.email,
      phone: stringOrNull(input.phone),
      website: stringOrNull(input.website),
      bio: stringOrNull(input.bio),
      skills: skills === null ? [] : skills,
      linkedin: stringOrNull(input.linkedin),
      github: stringOrNull(input.github),
      twitter: stringOrNull(input.twitter),
      avatarUrl: stringOrNull(input.avatarUrl),
      backgroundColor: color === null ? '#2e3a4e' : color,
      isPublic: published === null ? true : published,
    };
    const record = await this.createWithSlug(data);
    return this.toGraphql(record);
  }

  async update(userId: string, input: UpdateCardInput): Promise<Card> {
    const existing = await this.requireOwned(userId);
    const previousAvatar = existing.avatarUrl;
    const patch = this.toUpdatePatch(input);
    const record = await this.cards.update(existing.id, patch);
    await this.syncAvatarStorage(userId, previousAvatar, record.avatarUrl);
    return this.toGraphql(record);
  }

  async delete(userId: string): Promise<boolean> {
    const existing = await this.requireOwned(userId);
    await this.storage.deleteUserAvatars(existing.userId);
    await this.cards.deleteByUserId(userId);
    return true;
  }

  async publicBySlug(
    slug: string,
    viewer: AuthUser | null,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<PublicCard> {
    const record = await this.cards.findBySlug(slug);
    if (record === null || record.isPublic === false) {
      throw new BusinessException('Card not found', HttpStatus.NOT_FOUND);
    }
    await this.analytics.recordView(record, viewer, ipAddress, userAgent);
    return this.toPublic(record);
  }

  async recordViewByCardId(
    cardId: string,
    viewer: AuthUser | null,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<boolean> {
    const record = await this.cards.findById(cardId);
    if (record === null || record.isPublic === false) {
      throw new BusinessException('Card not found', HttpStatus.NOT_FOUND);
    }
    await this.analytics.recordView(record, viewer, ipAddress, userAgent);
    return true;
  }

  private async requireOwned(userId: string): Promise<CardRecord> {
    const existing = await this.cards.findByUserId(userId);
    if (existing === null) {
      throw new BusinessException('Card not found', HttpStatus.NOT_FOUND);
    }
    return existing;
  }

  private async syncAvatarStorage(
    userId: string,
    previous: string | null,
    next: string | null,
  ): Promise<void> {
    if (previous === next) {
      return;
    }
    if (next === null) {
      await this.storage.deleteUserAvatars(userId);
      return;
    }
    if (previous !== null) {
      await this.storage.deleteByPublicUrl(previous);
    }
  }

  private async createWithSlug(data: {
    userId: string;
    name: string;
    role: string | null;
    email: string;
    phone: string | null;
    website: string | null;
    bio: string | null;
    skills: string[];
    linkedin: string | null;
    github: string | null;
    twitter: string | null;
    avatarUrl: string | null;
    backgroundColor: string;
    isPublic: boolean;
  }): Promise<CardRecord> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt += 1) {
      try {
        return await this.cards.create({
          ...data,
          slug: this.slugs.generate(),
        });
      } catch (error) {
        if (error instanceof Error) {
          lastError = error;
          continue;
        }
        throw new BusinessException('Unable to create card');
      }
    }
    const message = lastError === null ? 'Unable to create card' : lastError.message;
    throw new BusinessException(message, HttpStatus.CONFLICT);
  }

  private toUpdatePatch(input: UpdateCardInput): Prisma.CardUpdateInput {
    const patch: Prisma.CardUpdateInput = {};
    const name = stringOrNull(input.name);
    if (name !== null) {
      patch.name = name;
    }
    if (typeof input.role === 'string') {
      patch.role = stringOrNull(input.role);
    }
    const email = stringOrNull(input.email);
    if (email !== null) {
      patch.email = email;
    }
    const phone = stringOrNull(input.phone);
    if (input.phone !== null && typeof input.phone === 'string') {
      patch.phone = phone;
    }
    const website = stringOrNull(input.website);
    if (typeof input.website === 'string') {
      patch.website = website;
    }
    const bio = stringOrNull(input.bio);
    if (typeof input.bio === 'string') {
      patch.bio = bio;
    }
    const skills = stringArrayOrNull(input.skills);
    if (skills !== null) {
      patch.skills = skills;
    }
    const avatarUrl = stringOrNull(input.avatarUrl);
    if (typeof input.avatarUrl === 'string') {
      patch.avatarUrl = avatarUrl;
    }
    const backgroundColor = stringOrNull(input.backgroundColor);
    if (backgroundColor !== null) {
      patch.backgroundColor = backgroundColor;
    }
    const linkedin = stringOrNull(input.linkedin);
    if (typeof input.linkedin === 'string') {
      patch.linkedin = linkedin;
    }
    const github = stringOrNull(input.github);
    if (typeof input.github === 'string') {
      patch.github = github;
    }
    const twitter = stringOrNull(input.twitter);
    if (typeof input.twitter === 'string') {
      patch.twitter = twitter;
    }
    const isPublic = booleanOrNull(input.isPublic);
    if (isPublic !== null) {
      patch.isPublic = isPublic;
    }
    return patch;
  }
}
