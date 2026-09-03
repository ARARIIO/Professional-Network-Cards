import type { ReactNode } from 'react';
import type { PublicCard } from '../../graphql/types';
import {
  cardContactRows,
  cardSocials,
  type CardContactRow,
} from '../../utils/card-contacts';
import { Avatar } from '../common/Avatar/Avatar';

type Props = {
  card: PublicCard;
  compact: boolean;
  interactive: boolean;
  children: ReactNode;
};

export function CardFace({ card, compact, interactive, children }: Props) {
  const rows = cardContactRows({
    email: card.email,
    phone: card.phone === null ? '' : card.phone,
    website: card.website === null ? '' : card.website,
  });
  const socials = cardSocials({
    linkedin: card.linkedin === null ? '' : card.linkedin,
    twitter: card.twitter === null ? '' : card.twitter,
    github: card.github === null ? '' : card.github,
  });

  return (
    <div className={compact ? 'panel card-face is-compact' : 'panel card-face'}>
      <div className="card-banner" style={{ background: card.backgroundColor }} />
      <div className="card-inner">
        <div className="card-top">
          <Avatar
            src={card.avatarUrl}
            name={card.name}
            className="card-avatar"
            fallbackColor={null}
          />
        </div>
        <div className="card-name">
          <h1>{card.name}</h1>
          {card.role !== null ? <div className="card-role">{card.role}</div> : null}
        </div>
        {card.bio !== null ? (
          <p className="card-bio" style={{ borderLeftColor: card.backgroundColor }}>
            {card.bio}
          </p>
        ) : null}
        {card.skills.length > 0 ? (
          <div className="card-section">
            <div className="card-section-label">Навыки</div>
            <div className="chips">
              {card.skills.map((skill) => (
                <span className="skill-pill" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {rows.length > 0 ? (
          <div className="card-section">
            <div className="card-section-label">Контакты</div>
            <div className="contact-list">
              {rows.map((row) => {
                const body = (
                  <>
                    <span className="contact-icon" aria-hidden="true">
                      <ContactGlyph kind={row.kind} />
                    </span>
                    <span className="contact-copy">
                      <span className="contact-label">{row.label}</span>
                      <span className="contact-value">{row.value}</span>
                    </span>
                    {interactive ? (
                      <span className="contact-action">{row.action}</span>
                    ) : null}
                  </>
                );
                if (interactive === false) {
                  return (
                    <div className="contact-row" key={row.kind}>
                      {body}
                    </div>
                  );
                }
                return <ContactRowLink key={row.kind} row={row} body={body} />;
              })}
            </div>
          </div>
        ) : null}
        {socials.length > 0 ? (
          <div className="card-section">
            <div className="card-section-label">Сети</div>
            <div className="card-socials">
              {socials.map((item) =>
                interactive ? (
                  <a
                    className="card-social"
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="card-social" key={item.label}>
                    {item.label}
                  </span>
                ),
              )}
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function ContactRowLink({
  row,
  body,
}: {
  row: CardContactRow;
  body: ReactNode;
}) {
  if (row.kind === 'website') {
    return (
      <a className="contact-row" href={row.href} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }
  return (
    <a className="contact-row" href={row.href}>
      {body}
    </a>
  );
}

function ContactGlyph({ kind }: { kind: 'email' | 'phone' | 'website' }) {
  if (kind === 'email') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" stroke="currentColor" />
        <path d="M2.5 4.5 8 8.25 13.5 4.5" stroke="currentColor" />
      </svg>
    );
  }
  if (kind === 'phone') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M4.2 2.8h2.1l.9 2.2-1.3 1.3a8.5 8.5 0 0 0 3.8 3.8l1.3-1.3 2.2.9v2.1c0 .6-.5 1.1-1.1 1.1C6.8 13 3 9.2 3 3.9c0-.6.5-1.1 1.2-1.1Z"
          stroke="currentColor"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" />
      <path d="M8 2.75v10.5M2.75 8h10.5M4.2 5.1c2.2 1 5.4 1 7.6 0M4.2 10.9c2.2-1 5.4-1 7.6 0" stroke="currentColor" />
    </svg>
  );
}
