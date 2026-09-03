import { AppShell } from '../components/layout/AppShell';
import { AnalyticsBoard } from '../components/analytics/AnalyticsBoard';
import { useAnalytics } from '../hooks/useAnalytics';
import { useCard } from '../hooks/useCard';

export function AnalyticsPage() {
  const { card, loading: cardLoading } = useCard();
  const { analytics, errorMessage } = useAnalytics(cardLoading || card === null);
  const saves = card === null ? 0 : card.savesCount;

  return (
    <AppShell>
      {errorMessage !== null ? <p className="form-error">{errorMessage}</p> : null}
      {cardLoading === false && card === null ? (
        <div className="page-analytics">
          <h2 className="page-title">Аналитика</h2>
          <div className="page-sub">Просмотры публичной визитки</div>
          <div className="panel empty-panel">
            <div className="empty-title">Нет данных</div>
            <div className="empty-text">Сначала создайте и опубликуйте визитку.</div>
          </div>
        </div>
      ) : null}
      {analytics !== null ? (
        <AnalyticsBoard analytics={analytics} saves={saves} />
      ) : null}
    </AppShell>
  );
}
