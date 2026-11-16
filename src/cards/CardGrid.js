import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/Language';

function CardImage({ card }) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState(false);

  if (!card.image || failed) {
    return <div className="pokemon-tcg-placeholder">{t('imageUnavailable')}</div>;
  }

  return <img src={`${card.image}/low.webp`} alt={card.name} loading="lazy"
    width="245" height="337" onError={() => setFailed(true)} />;
}

export default function CardGrid({ cards, linkState }) {
  const { t } = useLanguage();
  return (
    <ul className="pokemon-tcg-grid">
      {cards.map((card) => (
        <li className="pokemon-tcg-card" key={card.id}>
          <Link to={`/cards/${encodeURIComponent(card.id)}`} state={linkState}
            aria-label={`${t('viewCard')}: ${card.name} (${card.id})`}>
            <CardImage key={card.image} card={card} />
            <h3>{card.name}</h3>
            <span>{card.id}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
