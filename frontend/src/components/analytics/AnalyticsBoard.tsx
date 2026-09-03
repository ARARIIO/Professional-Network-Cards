import type { CardAnalytics } from '../../graphql/types';
import { formatCount, formatRelative } from '../../utils/format';
import { ViewsChart } from './ViewsChart';

type Props = {
  analytics: CardAnalytics;
  saves: number;
};

function viewSource(): string {
  return 'Прямая ссылка';
}

function viewPlace(ipAddress: string | null): string {
  if (ipAddress === null) {
    return '—';
  }
  return ipAddress;
}

export function AnalyticsBoard({ analytics, saves }: Props) {
  const week = analytics.lastSevenDaysViews.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="page-analytics">
      <h2 className="page-title">Аналитика</h2>
      <div className="page-sub">Просмотры публичной визитки</div>
      <div className="metrics">
        <div className="panel panel-pad">
          <div className="stat-label">7 дней</div>
          <div className="stat-value">{formatCount(week)}</div>
        </div>
        <div className="panel panel-pad">
          <div className="stat-label">Всего</div>
          <div className="stat-value">{formatCount(analytics.totalViews)}</div>
        </div>
        <div className="panel panel-pad">
          <div className="stat-label">Сохранений</div>
          <div className="stat-value">{formatCount(saves)}</div>
        </div>
      </div>
      <div className="panel panel-pad" style={{ marginTop: 16 }}>
        <ViewsChart data={analytics.lastSevenDaysViews} />
      </div>
      <div className="panel" style={{ marginTop: 16, overflow: 'hidden' }}>
        <div className="views-head">Последние просмотры</div>
        {analytics.recentViewers.length === 0 ? (
          <div className="view-row">
            <span className="view-source">Пока нет просмотров</span>
          </div>
        ) : (
          analytics.recentViewers.map((viewer) => (
            <div className="view-row" key={`${viewer.viewedAt}-${viewer.ipAddress}`}>
              <span className="view-source">{viewSource()}</span>
              <span className="view-place">{viewPlace(viewer.ipAddress)}</span>
              <span className="view-time">{formatRelative(viewer.viewedAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
