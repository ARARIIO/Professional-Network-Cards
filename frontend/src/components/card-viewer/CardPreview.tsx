import type { PublicCard } from '../../graphql/types';

type Props = {
  card: PublicCard;
};

export function CardPreview({ card }: Props) {
  return (
    <article>
      {card.avatarUrl !== null ? (
        <img src={card.avatarUrl} alt={card.name} width={96} height={96} />
      ) : null}
      <h2>{card.name}</h2>
      <p>{card.email}</p>
      {card.phone !== null ? <p>{card.phone}</p> : null}
      {card.website !== null ? (
        <p>
          <a href={card.website}>{card.website}</a>
        </p>
      ) : null}
      {card.bio !== null ? <p>{card.bio}</p> : null}
      {card.skills.length > 0 ? <p>{card.skills.join(', ')}</p> : null}
      <p>
        {card.linkedin !== null ? <a href={card.linkedin}>LinkedIn</a> : null}{' '}
        {card.github !== null ? <a href={card.github}>GitHub</a> : null}{' '}
        {card.twitter !== null ? <a href={card.twitter}>Twitter</a> : null}
      </p>
    </article>
  );
}
