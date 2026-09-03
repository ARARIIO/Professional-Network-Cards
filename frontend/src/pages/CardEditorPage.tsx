import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { CardForm } from '../components/card-editor/CardForm';
import { useAuth } from '../hooks/useAuth';
import { useCard } from '../hooks/useCard';
import { emptyToNull } from '../utils/auth';
import { graphqlErrorMessage } from '../utils/graphql-error';
import { API_URL } from '../constants';
import { DEFAULT_CARD_BG, type CardValues } from '../utils/validators';

function defaultsFromUser(
  name: string,
  email: string,
  card: {
    name: string;
    role: string | null;
    email: string;
    phone: string | null;
    website: string | null;
    bio: string | null;
    skills: string[];
    linkedin: string | null;
    github: string | null;
    twitter: string | null;
    avatarUrl: string | null;
    backgroundColor: string;
    isPublic: boolean;
  } | null,
): CardValues {
  if (card === null) {
    return {
      name,
      role: '',
      email,
      phone: '',
      website: '',
      bio: '',
      skills: [],
      linkedin: '',
      github: '',
      twitter: '',
      avatarUrl: '',
      backgroundColor: DEFAULT_CARD_BG,
      isPublic: true,
    };
  }
  return {
    name: card.name,
    role: card.role === null ? '' : card.role,
    email: card.email,
    phone: card.phone === null ? '' : card.phone,
    website: card.website === null ? '' : card.website,
    bio: card.bio === null ? '' : card.bio,
    skills: card.skills,
    linkedin: card.linkedin === null ? '' : card.linkedin,
    github: card.github === null ? '' : card.github,
    twitter: card.twitter === null ? '' : card.twitter,
    avatarUrl: card.avatarUrl === null ? '' : card.avatarUrl,
    backgroundColor: card.backgroundColor,
    isPublic: card.isPublic,
  };
}

export function CardEditorPage() {
  const { user } = useAuth();
  const { card, loading, errorMessage, createCard, updateCard, deleteCard } = useCard();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (user === null) {
    return null;
  }

  const onSubmit = async (values: CardValues) => {
    setError(null);
    const payload = {
      name: values.name,
      role: emptyToNull(values.role),
      email: values.email,
      phone: emptyToNull(values.phone),
      website: emptyToNull(values.website),
      bio: emptyToNull(values.bio),
      skills: values.skills,
      linkedin: emptyToNull(values.linkedin),
      github: emptyToNull(values.github),
      twitter: emptyToNull(values.twitter),
      avatarUrl: emptyToNull(values.avatarUrl),
      backgroundColor: emptyToNull(values.backgroundColor),
      isPublic: values.isPublic,
    };
    try {
      if (card === null) {
        await createCard(payload);
      } else {
        await updateCard(payload);
      }
    } catch (caught) {
      setError(caught instanceof Error ? graphqlErrorMessage(caught) : 'Не удалось сохранить');
    }
  };

  const onUploadAvatar = async (file: File): Promise<string> => {
    setError(null);
    const body = new FormData();
    body.append('file', file);
    const response = await fetch(`${API_URL}/storage/avatar`, {
      method: 'POST',
      credentials: 'include',
      body,
    });
    if (!response.ok) {
      setError('Не удалось загрузить фото');
      throw new Error('Не удалось загрузить фото');
    }
    const payload = await response.json();
    if (payload === null || typeof payload !== 'object') {
      throw new Error('Не удалось загрузить фото');
    }
    if (!('url' in payload)) {
      throw new Error('Не удалось загрузить фото');
    }
    const url = payload.url;
    if (typeof url !== 'string' || url.length === 0) {
      throw new Error('Не удалось загрузить фото');
    }
    return url;
  };

  return (
    <AppShell>
      {errorMessage !== null ? <p className="form-error">{errorMessage}</p> : null}
      {loading ? null : errorMessage === null ? (
        <CardForm
          key={card === null ? `new-${user.id}` : `${user.id}-${card.id}`}
          defaultValues={defaultsFromUser(user.name, user.email, card)}
          shareUrl={card === null ? '' : `${window.location.origin}/c/${card.slug}`}
          onSubmit={onSubmit}
          onUploadAvatar={onUploadAvatar}
          error={error}
          onDelete={
            card === null
              ? null
              : async () => {
                  setError(null);
                  try {
                    await deleteCard();
                    navigate('/dashboard');
                  } catch (caught) {
                    setError(
                      caught instanceof Error
                        ? graphqlErrorMessage(caught)
                        : 'Не удалось удалить',
                    );
                  }
                }
          }
        />
      ) : null}
    </AppShell>
  );
}
