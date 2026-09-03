import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <Link className="brand" to={user === null ? '/auth' : '/dashboard'}>
        <span className="brand-mark" />
        <span className="brand-name">Network Cards</span>
      </Link>
      <div className="topbar-spacer" />
      {user !== null ? (
        <button type="button" className="ghost-btn" onClick={() => void logout()}>
          Выйти
        </button>
      ) : null}
    </header>
  );
}
