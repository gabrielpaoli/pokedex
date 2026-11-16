import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../i18n/Language';
import CardGrid from '../cards/CardGrid';

const pageSize = 12;

function CardGallery({ speciesId }) {
  const { language, t } = useLanguage();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [limit, setLimit] = useState(pageSize);

  useEffect(() => {
    const controller = new AbortController();
    setCards(null);
    setError(false);

    async function loadCards() {
      try {
        const response = await axios(`https://api.tcgdex.net/v2/${language}/cards`, {
          signal: controller.signal,
          params: { dexId: `eq:${speciesId}` },
        });
        if (!Array.isArray(response.data)) throw new Error('Invalid TCGdex card list');
        if (!controller.signal.aborted) setCards(response.data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(true);
      }
    }

    loadCards();
    return () => controller.abort();
  }, [speciesId, language, attempt]);

  if (error) return <div><p role="alert">{t('cardsError')}</p><button onClick={() => setAttempt((value) => value + 1)}>{t('retry')}</button></div>;
  if (!cards) return <p role="status">{t('loadingCards')}</p>;
  if (cards.length === 0) return <p>{t('noCards')}</p>;

  return (
    <>
      <p className="pokemon-section-note">{t('cardsShown')}: {Math.min(limit, cards.length)} / {cards.length}</p>
      <CardGrid cards={cards.slice(0, limit)} linkState={{ fromPokemon: speciesId }} />
      {limit < cards.length && <button onClick={() => setLimit((value) => value + pageSize)}>{t('showMore')}</button>}
    </>
  );
}

export default function PokemonCards({ speciesId }) {
  const { language, t } = useLanguage();

  return (
    <section className="pokemon-panel" aria-labelledby="cards-title">
      <h2 id="cards-title">{t('cards')}</h2>
      <p className="pokemon-section-note">{t('cardsNote')} <a href="https://tcgdex.dev/" target="_blank" rel="noopener noreferrer">TCGdex</a>.</p>
      <CardGallery key={`${speciesId}-${language}`} speciesId={speciesId} />
    </section>
  );
}
