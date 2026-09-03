import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { initialsFromName } from '../../utils/format';
import { TopBar } from './TopBar';

type Props = {
  children: ReactNode;
};

const NAV = [
  { to: '/dashboard', label: 'Дашборд' },
  { to: '/card/edit', label: 'Редактор' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/analytics', label: 'Аналитика' },
];

export function AppShell({ children }: Props) {
  const { user } = useAuth();
  const displayName = user === null ? '' : user.name;
  const accountName =
    user !== null && user.card !== null ? user.card.name : displayName;

  return (
    <>
      <TopBar />
      <div className="app-shell">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-item is-active' : 'nav-item'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-account">
            <div className="avatar-sm">{initialsFromName(accountName)}</div>
            <div>
              <div className="account-name">{accountName}</div>
              <div className="account-sub">Личный аккаунт</div>
            </div>
          </div>
        </aside>
        <div className="content">{children}</div>
      </div>
    </>
  );
}
