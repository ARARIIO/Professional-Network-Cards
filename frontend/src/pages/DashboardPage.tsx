import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../hooks/useAuth';
import { useCard } from '../hooks/useCard';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCount, formatUpdated } from '../utils/format';

export function DashboardPage() {
  const { user } = useAuth();
  const { card, loading } = useCard();
  const { analytics } = useAnalytics(card === null);
  const [copied, setCopied] = useState(false);

  const saves = user === null ? 0 : user.contactsCount;
  const publicUrl =
    card === null ? '' : `${window.location.origin}/c/${card.slug}`;
  const week =
    analytics === null
      ? 0
      : analytics.lastSevenDaysViews.reduce((sum, day) => sum + day.count, 0);

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const saveRate =
    card === null || card.viewsCount === 0
      ? '0% от просмотров'
      : `${((saves / card.viewsCount) * 100).toFixed(1).replace('.', ',')}% от просмотров`;

  return (
    <AppShell>
      <div className="page-narrow">
        <h2 className="page-title">Дашборд</h2>
        <div className="page-sub">Состояние визитки и быстрые действия</div>
        {card === null && loading === false ? (
          <div className="panel empty-panel">
            <div className="empty-icon" />
            <div className="empty-title">Визитка ещё не создана</div>
            <div className="empty-text">
              Заполните имя, роль и контакты — ссылку и QR-код можно будет раздать
              сразу после публикации.
            </div>
            <Link
              to="/card/edit"
              className="primary-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              Создать визитку
            </Link>
          </div>
        ) : null}
        {card !== null ? (
          <div className="dash-grid">
            <div className="panel panel-pad">
              <div className="status-row">
                <span className="status-live">
                  <span className={card.isPublic ? 'dot' : 'dot dot-muted'} />
                  {card.isPublic ? 'Опубликована' : 'Черновик'}
                </span>
                <span className="muted-xs">{formatUpdated(card.updatedAt)}</span>
              </div>
              <div className="person-row">
                <div
                  className="swatch-lg"
                  style={{ background: card.backgroundColor }}
                />
                <div>
                  <div className="person-name">{card.name}</div>
                  <div className="person-role">
                    {card.role === null ? '' : card.role}
                  </div>
                </div>
              </div>
              <div className="link-row">
                <div className="link-box">networkcards.io/{card.slug}</div>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => void copyLink()}
                >
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
              <div className="actions-row">
                <Link
                  to="/card/edit"
                  className="primary-btn"
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  Редактировать
                </Link>
                <Link
                  to={`/c/${card.slug}`}
                  className="ghost-btn"
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  Открыть визитку
                </Link>
              </div>
            </div>
            <div className="stats-col">
              <div className="panel panel-pad">
                <div className="stat-label">Просмотры</div>
                <div className="stat-value">{formatCount(card.viewsCount)}</div>
                <div className="stat-hint">+{week} за последние 7 дней</div>
              </div>
              <div className="panel panel-pad">
                <div className="stat-label">Сохранений</div>
                <div className="stat-value">{formatCount(saves)}</div>
                <div className="stat-hint">{saveRate}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
