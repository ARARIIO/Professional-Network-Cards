import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <p>
        <NavLink to="/">Professional Network Cards</NavLink>
      </p>
      <nav>
        {user === null ? (
          <NavLink to="/auth">Вход</NavLink>
        ) : (
          <>
            <NavLink to="/dashboard">Кабинет</NavLink>
            <NavLink to="/card/edit">Визитка</NavLink>
            <NavLink to="/contacts">Контакты</NavLink>
            <NavLink to="/analytics">Аналитика</NavLink>
            <NavLink to="/profile">Профиль</NavLink>
            <button type="button" onClick={() => void logout()}>
              Выйти
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
