import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { CardForm } from '../components/card-editor/CardForm';
import { useAuth } from '../hooks/useAuth';
import { useCard } from '../hooks/useCard';
import { emptyToNull } from '../utils/auth';
import { graphqlErrorMessage } from '../utils/graphql-error';
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
    backgroundColor: card.backgroundColor,
    isPublic: card.isPublic,
  };
}

export function CardEditorPage() {
  const { user } = useAuth();
  const { card, loading, createCard, updateCard } = useCard();
  const [error, setError] = useState<string | null>(null);

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
      backgroundColor: emptyToNull(values.backgroundColor),
      isPublic: values.isPublic,
    };
    try {
      if (card === null) {
        await createCard(payload);
      } else {
        await updateCard({
          ...payload,
          avatarUrl: null,
        });
      }
    } catch (caught) {
      setError(caught instanceof Error ? graphqlErrorMessage(caught) : 'Не удалось сохранить');
    }
  };

  return (
    <AppShell>
      {loading ? null : (
        <CardForm
          key={card === null ? 'new' : card.id}
          defaultValues={defaultsFromUser(user.name, user.email, card)}
          onSubmit={onSubmit}
          error={error}
        />
      )}
    </AppShell>
  );
}
