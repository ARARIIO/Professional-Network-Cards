import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { TopBar } from '../components/layout/TopBar';
import { PublicCardView } from '../components/card-viewer/PublicCardView';
import { CardSkeleton } from '../components/card-viewer/CardSkeleton';
import { GET_CARD } from '../graphql/queries/getCard';
import { SAVE_CONTACT } from '../graphql/mutations/saveContact';
import type { PublicCard } from '../graphql/types';
import { useAuth } from '../hooks/useAuth';

type GetCardData = {
  getCard: PublicCard | null;
};

export function PublicCardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saveContact] = useMutation(SAVE_CONTACT);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathSlug = typeof slug === 'string' ? slug : '';
  const { data, loading, error: queryError } = useQuery<GetCardData>(GET_CARD, {
    variables: { slug: pathSlug },
    skip: pathSlug.length === 0,
  });

  const card = data === null || typeof data !== 'object' ? null : data.getCard;
  const shareUrl = `${window.location.origin}/c/${pathSlug}`;

  const onSave = async () => {
    if (user === null) {
      navigate('/auth');
      return;
    }
    if (card === null) {
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await saveContact({
        variables: {
          input: {
            name: card.name,
            email: card.email,
            phone: card.phone,
            website: card.website,
            bio: card.bio,
            skills: card.skills,
          },
        },
      });
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  if (pathSlug.length === 0) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <TopBar />
      {loading ? <CardSkeleton /> : null}
      {queryError !== null && typeof queryError === 'object' ? (
        <div className="public-wrap">
          <div className="public-col">
            <div className="panel empty-panel">
              <div className="empty-title">Карточка не найдена</div>
            </div>
          </div>
        </div>
      ) : null}
      {card === null && loading === false && queryError === null ? (
        <div className="public-wrap">
          <div className="public-col">
            <div className="panel empty-panel">
              <div className="empty-title">Карточка не найдена</div>
            </div>
          </div>
        </div>
      ) : null}
      {card !== null ? (
        <PublicCardView
          card={card}
          slug={pathSlug}
          shareUrl={shareUrl}
          saved={saved}
          saving={saving}
          error={error}
          onSave={() => void onSave()}
        />
      ) : null}
    </>
  );
}
