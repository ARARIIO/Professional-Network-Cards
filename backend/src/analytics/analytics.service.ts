import { Injectable } from '@nestjs/common';
import type { Card as CardRecord } from '../generated/prisma/client.js';
import type { AuthUser } from '../common/types/auth-user.js';
import {
  CardAnalytics,
  DayView,
  RecentViewer,
} from './entities/card-view.entity.js';
import { CardViewRepository } from './repositories/card-view.repository.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly views: CardViewRepository) {}

  countByCardId(cardId: string): Promise<number> {
    return this.views.countByCardId(cardId);
  }

  async recordView(
    card: CardRecord,
    viewer: AuthUser | null,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<void> {
    if (viewer !== null && viewer.id === card.userId) {
      return;
    }
    await this.views.create({
      cardId: card.id,
      userId: viewer === null ? null : viewer.id,
      ipAddress,
      userAgent,
    });
  }

  async forCard(cardId: string): Promise<CardAnalytics> {
    const totalViews = await this.views.countByCardId(cardId);
    const lastSevenDaysViews = await this.lastSevenDays(cardId);
    const recent = await this.views.findRecent(cardId, 20);
    const analytics = new CardAnalytics();
    analytics.totalViews = totalViews;
    analytics.lastSevenDaysViews = lastSevenDaysViews;
    analytics.recentViewers = recent.map((row) => {
      const viewer = new RecentViewer();
      viewer.viewedAt = row.viewedAt;
      viewer.ipAddress = row.ipAddress;
      viewer.userAgent = row.userAgent;
      return viewer;
    });
    return analytics;
  }

  private async lastSevenDays(cardId: string): Promise<DayView[]> {
    const start = startOfUtcDay(new Date());
    start.setUTCDate(start.getUTCDate() - 6);
    const rows = await this.views.findSince(cardId, start);
    const counts = new Map<string, number>();
    for (const row of rows) {
      const key = utcDateKey(row.viewedAt);
      const current = counts.get(key);
      if (typeof current === 'number') {
        counts.set(key, current + 1);
      } else {
        counts.set(key, 1);
      }
    }
    const days: DayView[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(start);
      day.setUTCDate(start.getUTCDate() + offset);
      const date = utcDateKey(day);
      const view = new DayView();
      view.date = date;
      const count = counts.get(date);
      view.count = typeof count === 'number' ? count : 0;
      days.push(view);
    }
    return days;
  }
}

function startOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function utcDateKey(value: Date): string {
  const year = value.getUTCFullYear().toString().padStart(4, '0');
  const month = (value.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = value.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
