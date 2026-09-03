import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Avatar } from '../components/common/Avatar/Avatar';
import { useContacts } from '../hooks/useContacts';
import { useContactInvites } from '../hooks/useContactInvites';
import {
  hitActionDisabled,
  hitActionLabel,
  usePublicCardSearch,
} from '../hooks/usePublicCardSearch';
import { API_URL } from '../constants';
import { formatShortDate, initialsFromName } from '../utils/format';
import { graphqlErrorMessage } from '../utils/graphql-error';
import type { PublicCardHit } from '../graphql/types';

export function ContactsPage() {
  const { contacts, loading, errorMessage, deleteContact, refetch } = useContacts();
  const invites = useContactInvites();
  const [query, setQuery] = useState('');
  const [findQuery, setFindQuery] = useState('');
  const [filter, setFilter] = useState('Все');
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [findError, setFindError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const { hits, loading: findLoading, errorMessage: searchError, inviteFromHit, refetch: refetchHits } =
    usePublicCardSearch(findQuery);

  const skillFilters = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((contact) => {
      contact.skills.forEach((skill) => set.add(skill));
    });
    return ['Все', ...Array.from(set)];
  }, [contacts]);

  const filtered = contacts.filter((contact) => {
    if (filter !== 'Все' && contact.skills.includes(filter) === false) {
      return false;
    }
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      return true;
    }
    const hay = `${contact.name} ${contact.email === null ? '' : contact.email} ${contact.bio === null ? '' : contact.bio}`;
    return hay.toLowerCase().includes(q);
  });

  const exportCsv = async () => {
    const response = await fetch(`${API_URL}/contacts/export`, {
      credentials: 'include',
    });
    if (response.ok === false) {
      window.alert('Не удалось экспортировать контакты');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const onInviteHit = async (hit: PublicCardHit) => {
    setFindError(null);
    setSavingSlug(hit.slug);
    try {
      await inviteFromHit(hit);
      await invites.refetch();
    } catch (caught) {
      setFindError(
        caught instanceof Error ? graphqlErrorMessage(caught) : 'Не удалось отправить заявку',
      );
    } finally {
      setSavingSlug(null);
    }
  };

  const onRespond = async (id: string, accept: boolean) => {
    setInviteError(null);
    setRespondingId(id);
    try {
      await invites.respondInvite(id, accept);
      await refetch();
      await refetchHits();
    } catch (caught) {
      setInviteError(
        caught instanceof Error ? graphqlErrorMessage(caught) : 'Не удалось ответить на заявку',
      );
    } finally {
      setRespondingId(null);
    }
  };

  const countLabel =
    filtered.length === 0
      ? 'Нет сохранённых визиток'
      : `${filtered.length} сохранённых визиток`;

  return (
    <AppShell>
      <div className="page-contacts">
        <div className="contacts-head">
          <div>
            <h2 className="page-title">Контакты</h2>
            <div className="page-sub">{countLabel}</div>
          </div>
          <button type="button" className="ghost-btn" onClick={() => void exportCsv()}>
            Экспорт в CSV
          </button>
        </div>
        {invites.incoming.length > 0 ? (
          <div className="panel panel-pad" style={{ marginBottom: 20 }}>
            <div className="field-label">Заявки на обмен</div>
            <div className="page-sub" style={{ marginTop: 8 }}>
              Кто-то просит сохранить вашу визитку. После согласия контакты появятся у обоих, если
              у отправителя тоже есть публичная карточка.
            </div>
            {inviteError !== null ? <p className="form-error">{inviteError}</p> : null}
            <div className="contact-table" style={{ marginTop: 12 }}>
              {invites.incoming.map((invite) => (
                <div className="contact-item" key={invite.id}>
                  <div className="avatar-md">{initialsFromName(invite.fromName)}</div>
                  <div className="contact-main">
                    <div className="contact-item-name">{invite.fromName}</div>
                    <div className="contact-item-role">{invite.fromEmail}</div>
                  </div>
                  <div className="contact-item-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      disabled={respondingId === invite.id}
                      onClick={() => void onRespond(invite.id, true)}
                    >
                      Принять
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      disabled={respondingId === invite.id}
                      onClick={() => void onRespond(invite.id, false)}
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="panel panel-pad" style={{ marginBottom: 20 }}>
          <div className="field-label">Найти визитку</div>
          <input
            className="search-input"
            value={findQuery}
            onChange={(event) => setFindQuery(event.target.value)}
            placeholder="имя, email или часть ссылки"
            style={{ width: '100%', marginTop: 8 }}
          />
          <div className="page-sub" style={{ marginTop: 8 }}>
            Отправьте заявку владельцу. Контакт появится только после согласия.
          </div>
          {searchError !== null ? <p className="form-error">{searchError}</p> : null}
          {findError !== null ? <p className="form-error">{findError}</p> : null}
          {findLoading ? <div className="page-sub" style={{ marginTop: 12 }}>Ищем…</div> : null}
          {findLoading === false && hits.length === 0 ? (
            <div className="page-sub" style={{ marginTop: 12 }}>
              Никого не нашли. Попробуйте другое имя или email.
            </div>
          ) : null}
          {hits.length > 0 ? (
            <div className="contact-table" style={{ marginTop: 12 }}>
              {hits.map((hit) => (
                <div className="contact-item" key={hit.slug}>
                  <Avatar
                    src={hit.avatarUrl}
                    name={hit.name}
                    className="avatar-md"
                    fallbackColor={hit.backgroundColor}
                  />
                  <div className="contact-main">
                    <div className="contact-item-name">{hit.name}</div>
                    <div className="contact-item-role">
                      {hit.role === null ? hit.email : hit.role}
                    </div>
                  </div>
                  <div className="contact-item-actions">
                    <Link to={`/c/${hit.slug}`} className="ghost-btn">
                      Открыть
                    </Link>
                    <button
                      type="button"
                      className={hitActionDisabled(hit) ? 'ghost-btn' : 'primary-btn'}
                      disabled={hitActionDisabled(hit) || savingSlug === hit.slug}
                      onClick={() => void onInviteHit(hit)}
                    >
                      {savingSlug === hit.slug ? 'Отправляем…' : hitActionLabel(hit)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="filters-row">
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по сохранённым: имя или email"
          />
          <div className="chips">
            {skillFilters.map((label) => (
              <button
                key={label}
                type="button"
                className={filter === label ? 'filter-btn is-on' : 'filter-btn'}
                onClick={() => setFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {errorMessage !== null ? <p className="form-error">{errorMessage}</p> : null}
        {loading === false && contacts.length === 0 ? (
          <div className="panel empty-panel" style={{ marginTop: 16 }}>
            <div className="empty-icon round" />
            <div className="empty-title">Пока никого нет</div>
            <div className="empty-text" style={{ maxWidth: 360 }}>
              Найдите публичную визитку выше и нажмите «Предложить». Контакт появится после согласия.
            </div>
          </div>
        ) : null}
        {loading === false && contacts.length > 0 && filtered.length === 0 ? (
          <div className="panel empty-panel" style={{ marginTop: 16 }}>
            <div className="empty-title">Ничего не найдено</div>
            <div className="empty-text" style={{ maxWidth: 360 }}>
              Попробуйте другой запрос или сбросьте фильтр навыков.
            </div>
          </div>
        ) : null}
        {filtered.length > 0 ? (
          <div className="panel contact-table">
            {filtered.map((contact) => (
              <div className="contact-item" key={contact.id}>
                <div className="avatar-md">{initialsFromName(contact.name)}</div>
                <div className="contact-main">
                  <div className="contact-item-name">{contact.name}</div>
                  <div className="contact-item-role">
                    {contact.email === null ? '' : contact.email}
                  </div>
                </div>
                <div className="chips" style={{ flex: 1 }}>
                  {contact.skills.map((skill) => (
                    <span className="tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="contact-date">{formatShortDate(contact.createdAt)}</div>
                <button
                  type="button"
                  className="ghost-btn nav-logout"
                  onClick={() => {
                    if (window.confirm('Удалить контакт?') === false) {
                      return;
                    }
                    void deleteContact(contact.id).catch(() => {
                      window.alert('Не удалось удалить контакт');
                    });
                  }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
