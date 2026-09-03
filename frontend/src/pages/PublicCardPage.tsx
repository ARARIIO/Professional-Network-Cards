import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { TopBar } from '../components/layout/TopBar';
import { PublicCardView } from '../components/card-viewer/PublicCardView';
import { CardSkeleton } from '../components/card-viewer/CardSkeleton';
import { GET_CARD } from '../graphql/queries/getCard';
import type { PublicCard } from '../graphql/types';
import { useAuth } from '../hooks/useAuth';
import { useCard } from '../hooks/useCard';
import { useContacts } from '../hooks/useContacts';
import { inviteStatusForSlug, useContactInvites } from '../hooks/useContactInvites';
import { graphqlErrorMessage } from '../utils/graphql-error';

type GetCardData = {
  getCard: PublicCard | null;
};

export function PublicCardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { card: mine } = useCard();
  const { outgoing, sendInvite, refetch: refetchInvites } = useContactInvites();
  const { contacts } = useContacts();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathSlug = typeof slug === 'string' ? slug : '';
  const { data, loading, error: queryError } = useQuery<GetCardData>(GET_CARD, {
    variables: { slug: pathSlug },
    skip: pathSlug.length === 0,
  });

  const card = data === null || typeof data !== 'object' ? null : data.getCard;
  const shareUrl = `${window.location.origin}/c/${pathSlug}`;
  const isOwn = mine !== null && mine.slug === pathSlug;
  const inviteStatus = inviteStatusForSlug(outgoing, pathSlug);
  const alreadySaved =
    card !== null &&
    contacts.some(
      (row) =>
        row.email !== null && row.email.toLowerCase() === card.email.toLowerCase(),
    );

  const onInvite = async () => {
    if (authLoading) {
      return;
    }
    if (user === null) {
      navigate(`/auth?next=${encodeURIComponent(`/c/${pathSlug}`)}`);
      return;
    }
    if (card === null) {
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await sendInvite(pathSlug);
      await refetchInvites();
    } catch (caught) {
      setError(
        caught instanceof Error ? graphqlErrorMessage(caught) : 'Не удалось отправить заявку',
      );
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
          isOwn={isOwn}
          inviteStatus={inviteStatus}
          alreadySaved={alreadySaved}
          saving={saving}
          error={error}
          onInvite={() => void onInvite()}
        />
      ) : null}
    </>
  );
}
