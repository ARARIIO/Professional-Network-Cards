import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DayView {
  @Field(() => String)
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class RecentViewer {
  @Field(() => Date)
  viewedAt: Date;

  @Field(() => String, { nullable: true })
  ipAddress: string | null;

  @Field(() => String, { nullable: true })
  userAgent: string | null;
}

@ObjectType()
export class CardAnalytics {
  @Field(() => Int)
  totalViews: number;

  @Field(() => [DayView])
  lastSevenDaysViews: DayView[];

  @Field(() => [RecentViewer])
  recentViewers: RecentViewer[];
}
