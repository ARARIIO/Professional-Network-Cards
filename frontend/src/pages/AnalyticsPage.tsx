import { AppShell } from '../components/layout/AppShell';
import { AnalyticsBoard } from '../components/analytics/AnalyticsBoard';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../hooks/useAuth';

export function AnalyticsPage() {
  const { user } = useAuth();
  const { analytics, loading, errorMessage } = useAnalytics();
  const saves = user === null ? 0 : user.contactsCount;

  return (
    <AppShell>
      {errorMessage !== null ? <p className="form-error">{errorMessage}</p> : null}
      {analytics === null && loading === false ? (
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
