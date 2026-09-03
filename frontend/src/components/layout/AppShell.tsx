import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar/Avatar';
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
  const { user, logout } = useAuth();
  const displayName = user === null ? '' : user.name;
  const accountName =
    user !== null && user.card !== null ? user.card.name : displayName;
  const avatarUrl =
    user !== null && user.card !== null ? user.card.avatarUrl : null;

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
            <Avatar
              src={avatarUrl}
              name={accountName}
              className="avatar-sm"
              fallbackColor={null}
            />
            <div className="sidebar-account-meta">
              <div className="account-name">{accountName}</div>
              <div className="account-sub">Личный аккаунт</div>
              <button
                type="button"
                className="nav-item nav-logout"
                onClick={() => void logout()}
              >
                Выйти
              </button>
            </div>
          </div>
        </aside>
        <div className="content">{children}</div>
      </div>
    </>
  );
}
