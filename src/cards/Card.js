import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useLanguage } from '../i18n/Language';
import EnergyIcon from './EnergyIcon';
import '../pokemon/Pokemon.css';
import './Card.css';

function CardDetails({ id }) {
  const { language, t } = useLanguage();
  const { state } = useLocation();
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setCard(null);
    setError('');
    setImageFailed(false);

    async function loadCard() {
      try {
        const { data } = await axios(`https://api.tcgdex.net/v2/${language}/cards/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (!data || typeof data.id !== 'string' || typeof data.name !== 'string') {
          throw new Error('Invalid TCGdex card details');
        }
        if (!controller.signal.aborted) setCard(data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.status === 404 ? 'cardNotFound' : 'cardError');
        }
      }
    }

    loadCard();
    return () => controller.abort();
  }, [id, language, attempt]);

  const pokemonId = state?.fromPokemon || card?.dexId?.[0];
  const searchOrigin = typeof state?.fromCards === 'string'
    && (state.fromCards === '/cards' || state.fromCards.startsWith('/cards?')) ? state.fromCards : null;
  const back = <Link className="pokemon-back" to={searchOrigin || (pokemonId ? `/pokedex/${pokemonId}` : '/pokedex')}>
    {t(searchOrigin ? 'backToCards' : pokemonId ? 'backToPokemon' : 'back')}
  </Link>;

  if (error) return <section className="pokemon-detail">{back}<p role="alert">{t(error)}</p><button onClick={() => setAttempt((value) => value + 1)}>{t('retry')}</button></section>;
  if (!card) return <section className="pokemon-detail">{back}<p role="status">{t('loadingCard')}</p></section>;

  const cardNumber = card.localId == null ? null : `${card.localId}${card.set?.cardCount?.official != null ? ` / ${card.set.cardCount.official}` : ''}`;
  const facts = [
    ['cardSet', card.set?.name],
    ['cardNumber', cardNumber],
    ['rarity', card.rarity],
    ['illustrator', card.illustrator],
    ['damageClass', card.category],
    ['hp', card.hp],
    ['type', card.types?.join(', ')],
    ['stage', card.stage],
    ['evolvesFrom', card.evolveFrom],
    ['retreat', card.retreat],
    ['regulationMark', card.regulationMark],
  ];

  return (
    <article className="pokemon-detail card-detail">
      {back}
      <div className="card-overview">
        <div className="card-artwork">
          {card.image && !imageFailed ? <>
            <img src={`${card.image}/high.webp`} alt={card.name} width="600" height="825" onError={() => setImageFailed(true)} />
            <a href={`${card.image}/high.webp`} target="_blank" rel="noopener noreferrer">{t('cardImageFull')}</a>
          </> : <div className="pokemon-tcg-placeholder">{t('imageUnavailable')}</div>}
          <div className="card-actions">
            {pokemonId && <Link className="card-action" to={`/pokedex/${pokemonId}`}>{t('viewInPokedex')}</Link>}
            <Link className="card-action" to={searchOrigin || '/cards'}>{t('exploreCards')}</Link>
          </div>
        </div>
        <div className="card-sheet">
          <header className="card-sheet-heading">
            <h1>{card.name}</h1>
            <span className="card-sheet-id">{card.id}</span>
          </header>
          <div className="card-sheet-subheading">
            <strong>{[card.category, card.suffix].filter(Boolean).join(' - ')}</strong>
            <span className="card-hit-points">
              {card.hp != null && <span>{t('hp')} <strong>{card.hp}</strong></span>}
              {card.types?.map((type) => <EnergyIcon key={type} type={type} />)}
            </span>
          </div>
          {(card.stage || card.evolveFrom) && <p className="card-stage">
            {card.stage}{card.evolveFrom && ` / ${t('evolvesFrom')}: ${card.evolveFrom}`}
          </p>}
          {card.abilities?.length > 0 && <section className="card-sheet-section" aria-labelledby="card-abilities">
            <h2 id="card-abilities">{t('abilities')}</h2>
            <ul className="pokemon-resources">
              {card.abilities.map((ability, index) => <li className="card-ability" key={index}>
                <h3>{ability.name}</h3>
                {ability.type && <span className="pokemon-category">{ability.type}</span>}
                {ability.effect && <p className="card-effect">{ability.effect}</p>}
              </li>)}
            </ul>
          </section>}
          {card.attacks?.length > 0 && <section className="card-sheet-section" aria-labelledby="card-attacks">
            <h2 id="card-attacks">{t('cardAttacks')}</h2>
            <ul className="card-attacks">
              {card.attacks.map((attack, index) => <li className="card-attack" key={index}>
                <div className="card-attack-heading">
                  <span className="card-energy-cost" role="group" aria-label={t('energyCost')}>
                    {attack.cost ? (attack.cost.length > 0 ? attack.cost.map((type, energyIndex) => <EnergyIcon key={energyIndex} type={type} />) : <span>{t('noEnergyCost')}</span>) : t('unavailable')}
                  </span>
                  <h3>{attack.name}</h3>
                  {attack.damage != null && <span className="card-attack-damage" aria-label={`${t('damage')}: ${attack.damage}`}>{attack.damage}</span>}
                </div>
                {attack.effect && <p className="card-effect">{attack.effect}</p>}
              </li>)}
            </ul>
          </section>}
          {card.description && <p className="card-flavor">{card.description}</p>}
          <section className="card-battle-panel" aria-label={t('cardBattle')}>
            <dl className="card-battle-facts">
              {['weaknesses', 'resistances'].map((label) => <div key={label}>
                <dt>{t(label)}</dt>
                <dd>{card[label]?.length > 0 ? card[label].map(({ type, value }, index) => <span className="card-matchup" key={index}><EnergyIcon type={type} />{value}</span>) : t('unavailable')}</dd>
              </div>)}
              <div>
                <dt>{t('retreat')}</dt>
                <dd className="card-energy-cost">{Number.isInteger(card.retreat) && card.retreat >= 0
                  ? (card.retreat === 0 ? '0' : Array.from({ length: card.retreat }, (_, index) => <EnergyIcon key={index} type="Colorless" />))
                  : t('unavailable')}</dd>
              </div>
            </dl>
            <div className="card-set-summary">
              <div><strong>{card.set?.name || t('unavailable')}</strong>
                <p>{cardNumber ?? t('unavailable')} {card.rarity}</p>
              </div>
            </div>
          </section>
          <p className="card-illustrator">{t('illustrator')}: <strong>{card.illustrator || t('unavailable')}</strong></p>
          <details className="pokemon-panel pokemon-disclosure card-extra-details">
            <summary>{t('information')}</summary>
            <dl className="pokemon-facts">
              {facts.map(([label, value]) => <div key={label}><dt>{t(label)}</dt><dd>{value ?? t('unavailable')}</dd></div>)}
            </dl>
            {card.dexId?.length > 0 && <>
              <h3>{t('relatedPokemon')}</h3>
              <div className="pokemon-tags">
                {card.dexId.map((dexId) => <Link key={dexId} to={`/pokedex/${dexId}`}>#{String(dexId).padStart(3, '0')}</Link>)}
              </div>
            </>}
          {card.variants && <section className="pokemon-panel" aria-labelledby="card-variants">
            <h2 id="card-variants">{t('cardVariants')}</h2>
            <div className="pokemon-tags">
              {Object.entries(card.variants).filter(([, available]) => available).map(([variant]) => <span className="pokemon-category" key={variant}>{t(variant)}</span>)}
            </div>
          </section>}
          <section className="pokemon-panel" aria-labelledby="card-legality">
            <h2 id="card-legality">{t('cardLegality')}</h2>
            <dl className="pokemon-facts">
              {['standard', 'expanded'].map((format) => <div key={format}>
                <dt>{t(`${format}Format`)}</dt>
                <dd>{typeof card.legal?.[format] === 'boolean' ? t(card.legal[format] ? 'yes' : 'no') : t('unavailable')}</dd>
              </div>)}
            </dl>
          </section>
          </details>
        </div>
      </div>
      <p className="pokemon-section-note">{t('cardCredit')} <a href="https://tcgdex.dev/" target="_blank" rel="noopener noreferrer">TCGdex</a>.</p>
    </article>
  );
}

export default function Card() {
  const { id } = useParams();
  const { language } = useLanguage();
  return <CardDetails key={`${language}-${id}`} id={id} />;
}
