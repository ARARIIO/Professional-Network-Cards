import { useState } from 'react';
import type { PublicCard } from '../../graphql/types';
import { buildVCard } from '../../utils/vcard';
import { CardFace } from './CardFace';

type Props = {
  card: PublicCard;
  slug: string;
  shareUrl: string;
  isOwn: boolean;
  inviteStatus: string;
  alreadySaved: boolean;
  saving: boolean;
  error: string | null;
  onInvite: () => void;
};

export function PublicCardView({
  card,
  slug,
  shareUrl,
  isOwn,
  inviteStatus,
  alreadySaved,
  saving,
  error,
  onInvite,
}: Props) {
  const [copied, setCopied] = useState(false);
  const shareAvailable = typeof navigator.share === 'function';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      return;
    }
  };

  const shareLink = async () => {
    try {
      await navigator.share({
        title: card.name,
        text: card.role === null ? card.name : `${card.name} · ${card.role}`,
        url: shareUrl,
      });
    } catch (caught) {
      if (caught instanceof Error && caught.name === 'AbortError') {
        return;
      }
      await copyLink();
    }
  };

  const downloadVCard = () => {
    const body = buildVCard(card, shareUrl);
    const blob = new Blob([body], { type: 'text/vcard;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${slug}.vcf`;
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="public-wrap">
      <div className="public-col">
        <CardFace card={card} compact={false} interactive={true}>
          <div className="share-box">
            <div className="share-title">Поделиться визиткой</div>
            <div className="share-hint">Ссылка или файл для адресной книги</div>
            <div className="share-actions">
              {shareAvailable ? (
                <button type="button" className="ghost-btn" onClick={() => void shareLink()}>
                  Поделиться
                </button>
              ) : null}
              <button type="button" className="ghost-btn" onClick={() => void copyLink()}>
                {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
              </button>
              <button type="button" className="ghost-btn" onClick={downloadVCard}>
                Скачать .vcf
              </button>
            </div>
          </div>
          {isOwn ? null : (
            <button
              type="button"
              className="save-btn"
              style={{ background: card.backgroundColor }}
              disabled={
                alreadySaved ||
                inviteStatus === 'accepted' ||
                inviteStatus === 'pending' ||
                saving
              }
              onClick={onInvite}
            >
              {publicInviteLabel(alreadySaved, inviteStatus, saving)}
            </button>
          )}
          {error !== null ? <p className="form-error">{error}</p> : null}
        </CardFace>
      </div>
    </div>
  );
}

function publicInviteLabel(
  alreadySaved: boolean,
  inviteStatus: string,
  saving: boolean,
): string {
  if (saving) {
    return 'Отправляем…';
  }
  if (alreadySaved || inviteStatus === 'accepted') {
    return 'Контакт сохранён';
  }
  if (inviteStatus === 'pending') {
    return 'Заявка отправлена';
  }
  if (inviteStatus === 'declined') {
    return 'Отправить снова';
  }
  return 'Предложить обмен контактами';
}
