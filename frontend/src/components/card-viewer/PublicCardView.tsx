import { QRCodeSVG } from 'qrcode.react';
import type { PublicCard } from '../../graphql/types';
import { hrefOrNull, initialsFromName } from '../../utils/format';

type Props = {
  card: PublicCard;
  slug: string;
  shareUrl: string;
  saved: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
};

type ContactRow = {
  tag: string;
  value: string;
  action: string;
  href: string;
};

export function PublicCardView({
  card,
  slug,
  shareUrl,
  saved,
  saving,
  error,
  onSave,
}: Props) {
  const rows: ContactRow[] = [];
  rows.push({
    tag: '@',
    value: card.email,
    action: 'Написать',
    href: `mailto:${card.email}`,
  });
  if (card.phone !== null) {
    rows.push({
      tag: 'tel',
      value: card.phone,
      action: 'Позвонить',
      href: `tel:${card.phone}`,
    });
  }
  const site = hrefOrNull(card.website);
  if (card.website !== null && site !== null) {
    rows.push({
      tag: 'www',
      value: card.website,
      action: 'Открыть',
      href: site,
    });
  }

  const socials: { label: string; href: string }[] = [];
  const linkedin = hrefOrNull(card.linkedin);
  const twitter = hrefOrNull(card.twitter);
  const github = hrefOrNull(card.github);
  if (linkedin !== null) {
    socials.push({ label: 'in', href: linkedin });
  }
  if (twitter !== null) {
    socials.push({ label: 'X', href: twitter });
  }
  if (github !== null) {
    socials.push({ label: 'gh', href: github });
  }

  return (
    <div className="public-wrap">
      <div className="public-col">
        <div className="public-meta">
          <span className="public-url">networkcards.io/{slug}</span>
        </div>
        <div className="panel card-face">
          <div className="card-banner" style={{ background: card.backgroundColor }} />
          <div className="card-inner">
            <div className="card-top">
              <div className="card-avatar">{initialsFromName(card.name)}</div>
              <span className="qr-badge">Открыто по QR</span>
            </div>
            <div className="card-name">
              <h1>{card.name}</h1>
              {card.role !== null ? <div className="card-role">{card.role}</div> : null}
            </div>
            {card.bio !== null ? <p className="card-bio">{card.bio}</p> : null}
            {card.skills.length > 0 ? (
              <div className="chips" style={{ marginTop: 18 }}>
                {card.skills.map((skill) => (
                  <span className="skill-pill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="rule" />
            <div className="contact-list">
              {rows.map((row) => (
                <a className="contact-row" key={row.tag} href={row.href}>
                  <span className="contact-tag">{row.tag}</span>
                  <span className="contact-value">{row.value}</span>
                  <span className="contact-action">{row.action}</span>
                </a>
              ))}
            </div>
            {socials.length > 0 ? (
              <div className="socials">
                {socials.map((item) => (
                  <a className="social-dot" key={item.label} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
            <div className="qr-box">
              <div className="qr-frame">
                <QRCodeSVG value={shareUrl} size={76} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>QR-код визитки</div>
                <div style={{ marginTop: 3, fontSize: 12.5, color: '#8a8a90' }}>
                  Наведите камеру, чтобы открыть эту страницу
                </div>
              </div>
            </div>
            <button
              type="button"
              className="save-btn"
              style={{ background: card.backgroundColor }}
              disabled={saved || saving}
              onClick={onSave}
            >
              {saved ? 'Контакт сохранён' : 'Сохранить контакт'}
            </button>
            <div className="vcf-note">.vcf — добавится в адресную книгу</div>
            {error !== null ? <p className="form-error">{error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
