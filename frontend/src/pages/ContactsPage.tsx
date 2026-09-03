import { useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useContacts } from '../hooks/useContacts';
import { API_URL } from '../constants';
import { formatShortDate, initialsFromName } from '../utils/format';

export function ContactsPage() {
  const { contacts, loading, errorMessage } = useContacts();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Все');

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
        <div className="filters-row">
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по имени или компании"
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
        {loading === false && filtered.length === 0 ? (
          <div className="panel empty-panel" style={{ marginTop: 16 }}>
            <div className="empty-icon round" />
            <div className="empty-title">Пока никого нет</div>
            <div className="empty-text" style={{ maxWidth: 360 }}>
              Контакты появятся здесь, когда вы сохраните чью-то визитку — по ссылке
              или через QR-код.
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
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
