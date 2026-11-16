import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../i18n/Language';
import CardGrid from './CardGrid';
import qtyList from '../json/qtyList';
import '../pokemon/Pokemon.css';
import './Card.css';

function SearchResults({ query, type, set, quantity, origin }) {
  const { language, t } = useLanguage();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [limit, setLimit] = useState(quantity);

  useEffect(() => {
    const controller = new AbortController();
    setCards(null);
    setError(false);
    async function searchCards() {
      try {
        const { data } = await axios(`https://api.tcgdex.net/v2/${language}/cards`, {
          signal: controller.signal,
          params: {
            ...(query ? { name: query } : {}),
            ...(type ? { types: `eq:${type}` } : {}),
            ...(set ? { 'set.id': `eq:${set}` } : {}),
          },
        });
        if (!Array.isArray(data)) throw new Error('Invalid TCGdex search results');
        if (!controller.signal.aborted) setCards(data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(true);
      }
    }
    searchCards();
    return () => controller.abort();
  }, [query, type, set, language, attempt]);

  if (error) return <div><p role="alert">{t('cardsError')}</p><button onClick={() => setAttempt((value) => value + 1)}>{t('retry')}</button></div>;
  if (!cards) return <p role="status">{t('loadingCards')}</p>;
  if (cards.length === 0) return <p role="status">{t('noCardResults')}</p>;

  return <>
    <p role="status">{t('cardsShown')}: {Math.min(limit, cards.length)} / {cards.length}</p>
    <CardGrid cards={cards.slice(0, limit)} linkState={{ fromCards: origin }} />
    {limit < cards.length && <div className="card-load-more"><button onClick={() => setLimit((value) => value + quantity)}>{t('showMore')} <span>+{quantity}</span></button></div>}
  </>;
}

function CardsContent() {
  const { language, t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(null);
  const [filtersError, setFiltersError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState((params.get('q') || '').trim());
  const rawQuery = params.get('q') || '';
  const type = params.get('typeLanguage') === language ? params.get('type') || '' : '';
  const set = params.get('set') || '';
  const requestedQuantity = Number(params.get('qty'));
  const quantity = qtyList.some(({ name }) => name === requestedQuantity) ? requestedQuantity : 25;

  useEffect(() => {
    const timer = setTimeout(() => setQuery(rawQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  useEffect(() => {
    const controller = new AbortController();
    setFilters(null);
    setFiltersError(false);
    async function loadFilters() {
      try {
        const [types, sets] = await Promise.all([
          axios(`https://api.tcgdex.net/v2/${language}/types`, { signal: controller.signal }),
          axios(`https://api.tcgdex.net/v2/${language}/sets`, { signal: controller.signal }),
        ]);
        if (!Array.isArray(types.data) || !types.data.every((item) => typeof item === 'string')
          || !Array.isArray(sets.data) || !sets.data.every((item) => typeof item.id === 'string' && typeof item.name === 'string')) {
          throw new Error('Invalid TCGdex filters');
        }
        if (!controller.signal.aborted) setFilters({ types: types.data, sets: sets.data });
      } catch (requestError) {
        if (!controller.signal.aborted) setFiltersError(true);
      }
    }
    loadFilters();
    return () => controller.abort();
  }, [language, attempt]);

  function updateFilter(key, value) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key === 'type') {
        if (value) next.set('typeLanguage', language);
        else next.delete('typeLanguage');
      }
      return next;
    }, { replace: true });
  }

  const pendingSearch = rawQuery.trim() !== query;
  const origin = `/cards${params.toString() ? `?${params}` : ''}`;

  return (
    <article className="pokemon-detail card-search-page">
      <header className="pokemon-heading"><h1>{t('searchCards')}</h1><p>{t('cardSearchNote')}</p></header>
      <section className="pokemon-panel" aria-label={t('searchCards')}>
        <form className="card-search-form card-search-filters" role="search" onSubmit={(event) => event.preventDefault()}>
          <div className="card-search-name">
            <label htmlFor="card-query">{t('cardName')}</label>
            <input id="card-query" type="search" value={rawQuery} placeholder={t('cardSearchPlaceholder')}
              onChange={(event) => updateFilter('q', event.target.value)} />
          </div>
          <div>
            <label htmlFor="card-set">{t('cardSet')}</label>
            <select id="card-set" value={set} disabled={!filters} onChange={(event) => updateFilter('set', event.target.value)}>
              <option value="">{t('all')}</option>
              {filters && set && !filters.sets.some((item) => item.id === set) && <option value={set}>{set}</option>}
              {filters?.sets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="card-quantity">{t('quantity')}</label>
            <select id="card-quantity" value={quantity} onChange={(event) => updateFilter('qty', event.target.value)}>
              {qtyList.map(({ name }) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="card-type">{t('type')}</label>
            <select id="card-type" value={type} disabled={!filters} onChange={(event) => updateFilter('type', event.target.value)}>
              <option value="">{t('all')}</option>
              {filters && type && !filters.types.includes(type) && <option value={type}>{type}</option>}
              {filters?.types.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </form>
        {filtersError ? <div><p role="alert">{t('cardFiltersError')}</p><button onClick={() => setAttempt((value) => value + 1)}>{t('retry')}</button></div>
          : !filters && <p role="status">{t('loadingCardFilters')}</p>}
        {pendingSearch ? <p role="status">{t('loadingCards')}</p> : <SearchResults
          key={`${language}-${query}-${type}-${set}-${quantity}`}
          query={query} type={type} set={set} quantity={quantity} origin={origin} />}
      </section>
      <p className="pokemon-section-note">{t('cardCredit')} <a href="https://tcgdex.dev/" target="_blank" rel="noopener noreferrer">TCGdex</a>.</p>
    </article>
  );
}

export default function Cards() {
  const { language } = useLanguage();
  return <CardsContent key={language} />;
}
