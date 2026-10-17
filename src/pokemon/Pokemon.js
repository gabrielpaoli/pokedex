import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { formatName, localized, useLanguage } from '../i18n/Language';
import { Moves, ResourceDetails } from './ResourceDetails';
import TypeBadge from './TypeBadge';
import GameAppearances from './GameAppearances';
import './Pokemon.css';

const resourceId = (url) => url.split('/').filter(Boolean).pop();
const artwork = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

function evolutionConditions(details, language, t) {
  return details.map((detail) => Object.entries(detail)
    .filter(([key, value]) => key !== 'is_default' && key !== 'version_group' && value !== null && value !== '' && value !== false)
    .map(([key, value]) => {
      let label;
      if (typeof value === 'object') label = localized(value.names, language)?.name || t(value.name);
      else if (typeof value === 'boolean') label = t(value ? 'yes' : 'no');
      else if (key === 'gender') label = t(value === 1 ? 'female' : 'male');
      else if (key === 'relative_physical_stats') label = t(value === 0 ? 'statsEqual' : value === 1 ? 'attackHigher' : 'defenseHigher');
      else label = typeof value === 'string' ? t(value) : value;
      return `${t(key)}: ${label}`;
    })).filter((conditions, index, alternatives) => conditions.length > 0
      && alternatives.findIndex((alternative) => JSON.stringify(alternative) === JSON.stringify(conditions)) === index);
}

function Evolution({ node, currentId }) {
  const { language, t } = useLanguage();
  const name = localized(node.names, language)?.name || formatName(node.species.name);
  return (
    <li className="evolution-node">
      <Link className="evolution-card" to={`/pokedex/${node.pokemonId}`} aria-current={Number(currentId) === Number(node.pokemonId) ? 'page' : undefined}>
        <img src={artwork(node.pokemonId)} alt={name} loading="lazy" />
        <span className="evolution-number">#{String(node.pokemonId).padStart(3, '0')}</span>
        <strong>{name}</strong>
        {Number(currentId) === Number(node.pokemonId) && <span className="evolution-selected">{t('currentPokemon')}</span>}
      </Link>
      {node.evolves_to.length > 0 && (
        <ul className="evolution-branches">
          {node.evolves_to.map((child) => (
            <li className="evolution-branch" key={child.species.url}>
              <div className="evolution-transition">
                <span className="evolution-arrow" role="img" aria-label={t('evolvesInto')}>→</span>
                <div className="evolution-conditions">
                  {evolutionConditions(child.evolution_details, language, t).map((conditions, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <span className="evolution-or">{t('or')}</span>}
                      <ul className="evolution-condition">{conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <ul className="evolution-list"><Evolution node={child} currentId={currentId} /></ul>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

const Pokemon = () => {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const [data, setData] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [error, setError] = useState('');
  const [evolutionError, setEvolutionError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    setData(null);
    setEvolution(null);
    setError('');
    setEvolutionError(false);

    async function fetchData() {
      let pokemon;
      let species;
      try {
        pokemon = (await axios(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(id)}`, options)).data;
        species = (await axios(pokemon.species.url, options)).data;
        if (controller.signal.aborted) return;
        setData({ pokemon, species });
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(requestError.response?.status === 404 ? 'notFound' : 'loadError');
        return;
      }

      if (!species.evolution_chain) return;
      try {
        const response = await axios(species.evolution_chain.url, options);
        const resources = new Map();
        function fetchResource(resource) {
          if (!resources.has(resource.url)) resources.set(resource.url, axios(resource.url, options).then((result) => result.data));
          return resources.get(resource.url);
        }
        async function resolveEvolution(node) {
          const nodeSpecies = node.species.url === pokemon.species.url ? species : await fetchResource(node.species);
          const defaultVariety = nodeSpecies.varieties.find((variety) => variety.is_default);
          if (!defaultVariety) throw new Error('Evolution species has no default variety');
          const [children, details] = await Promise.all([
            Promise.all(node.evolves_to.map(resolveEvolution)),
            Promise.all(node.evolution_details.map(async (detail) => Object.fromEntries(await Promise.all(
              Object.entries(detail).map(async ([key, value]) => {
                if (value && typeof value === 'object' && value.url) {
                  const resource = await fetchResource(value);
                  return [key, { ...value, names: resource.names }];
                }
                return [key, value];
              })
            )))),
          ]);
          return { ...node, names: nodeSpecies.names, pokemonId: resourceId(defaultVariety.pokemon.url), evolution_details: details, evolves_to: children };
        }
        const chain = await resolveEvolution(response.data.chain);
        if (!controller.signal.aborted) setEvolution(chain);
      } catch (requestError) {
        if (!controller.signal.aborted) setEvolutionError(true);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [id, attempt]);

  const retry = () => setAttempt((value) => value + 1);
  if (error) {
    return <section className="pokemon-detail"><p role="alert">{t(error)}</p><button onClick={retry}>{t('retry')}</button><p><Link to="/pokedex">{t('back')}</Link></p></section>;
  }
  if (!data) return <p className="pokemon-detail" role="status">{t('loading')}</p>;

  const { pokemon, species } = data;
  const description = localized(species.flavor_text_entries, language);
  const genus = localized(species.genera, language);
  const name = pokemon.is_default === false ? formatName(pokemon.name) : localized(species.names, language)?.name || formatName(pokemon.name);
  const image = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
  const sprites = [
    ['front', pokemon.sprites.front_default],
    ['backSprite', pokemon.sprites.back_default],
    ['shinyFront', pokemon.sprites.front_shiny],
    ['shinyBack', pokemon.sprites.back_shiny],
  ].filter(([, url]) => url);

  return (
    <article className="pokemon-detail">
      <Link className="pokemon-back" to="/pokedex">{t('back')}</Link>
      <header className="pokemon-heading">
        <h1>{name} <span>#{String(pokemon.id).padStart(3, '0')}</span></h1>
        <p>{genus?.genus}</p>
      </header>
      <div className="pokemon-overview">
        <div className="pokemon-artwork">
          {image ? <img src={image} alt={name} /> : <p>{t('imageUnavailable')}</p>}
          <div className="pokemon-tags">
            {pokemon.types.map(({ type }) => <TypeBadge key={type.name} type={type.name} />)}
          </div>
        </div>
        <section className="pokemon-panel" aria-labelledby="information-title">
          <h2 id="information-title">{t('information')}</h2>
          <p>{description ? description.flavor_text.replace(/[\n\f\r]+/g, ' ') : t('descriptionUnavailable')}</p>
          <dl className="pokemon-facts">
            <div><dt>{t('height')}</dt><dd>{pokemon.height / 10} m</dd></div>
            <div><dt>{t('weight')}</dt><dd>{pokemon.weight / 10} kg</dd></div>
            <div><dt>{t('experience')}</dt><dd>{pokemon.base_experience ?? t('unavailable')}</dd></div>
            <div><dt>{t('generation')}</dt><dd>{t(species.generation.name)}</dd></div>
            <div><dt>{t('habitat')}</dt><dd>{species.habitat ? t(species.habitat.name) : t('unavailable')}</dd></div>
            <div><dt>{t('capture')}</dt><dd>{species.capture_rate}</dd></div>
            <div><dt>{t('happiness')}</dt><dd>{species.base_happiness ?? t('unavailable')}</dd></div>
            <div><dt>{t('growth')}</dt><dd>{t(species.growth_rate.name)}</dd></div>
            <div><dt>{t('eggGroups')}</dt><dd>{species.egg_groups.map((group) => group.name === 'ground' && language === 'es' ? 'Campo' : t(group.name)).join(', ') || t('unavailable')}</dd></div>
            <div><dt>{t('gender')}</dt><dd>{species.gender_rate === -1 ? t('genderless') : `${species.gender_rate * 12.5}% ${t('female')} / ${100 - species.gender_rate * 12.5}% ${t('male')}`}</dd></div>
            <div><dt>{t('classification')}</dt><dd>{t(species.is_mythical ? 'mythical' : species.is_legendary ? 'legendary' : 'normal')}</dd></div>
          </dl>
          <h3>{t('abilities')}</h3>
          <ul className="pokemon-resources">
            {pokemon.abilities.map(({ ability, is_hidden }) => <ResourceDetails key={ability.name} resource={ability} hidden={is_hidden} />)}
          </ul>
        </section>
      </div>

      <section className="pokemon-panel" aria-labelledby="stats-title">
        <div className="pokemon-section-heading">
          <h2 id="stats-title">{t('stats')}</h2>
          <span className="pokemon-stat-total">{t('total')} <strong>{pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}</strong></span>
        </div>
        <div className="pokemon-stats">
          {pokemon.stats.map(({ stat, base_stat, effort }) => (
            <div className={`pokemon-stat pokemon-stat-${stat.name}`} key={stat.name}>
              <span>{t(stat.name)}</span>
              <div className="pokemon-stat-track" role="meter" aria-label={t(stat.name)} aria-valuemin={0} aria-valuemax={255} aria-valuenow={base_stat}>
                <span style={{ width: `${Math.min(base_stat / 255, 1) * 100}%` }} />
              </div>
              <strong>{base_stat}</strong>
              <small>EV: {effort}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="pokemon-panel" aria-labelledby="evolutions-title">
        <h2 id="evolutions-title">{t('evolutions')}</h2>
        <p className="pokemon-section-note">{t('evolutionNote')}</p>
        {evolutionError ? <div><p role="alert">{t('evolutionError')}</p><button onClick={retry}>{t('retry')}</button></div>
          : !species.evolution_chain ? <p>{t('noEvolutions')}</p>
            : !evolution ? <p role="status">{t('loadingEvolutions')}</p>
              : <><div className="evolution-scroll" role="region" aria-label={t('evolutions')} tabIndex={0}><ul className="evolution-list"><Evolution node={evolution} currentId={pokemon.id} /></ul></div>{evolution.evolves_to.length === 0 && <p>{t('doesNotEvolve')}</p>}</>}
      </section>

      <section className="pokemon-panel" aria-labelledby="sprites-title">
        <h2 id="sprites-title">{t('sprites')}</h2>
        <div className="pokemon-sprites">
          {sprites.map(([label, url]) => <figure key={label}><img src={url} alt={`${name}: ${t(label)}`} loading="lazy" /><figcaption>{t(label)}</figcaption></figure>)}
          {sprites.length === 0 && <p>{t('noSprites')}</p>}
        </div>
      </section>
      <section className="pokemon-panel" aria-labelledby="varieties-title">
        <h2 id="varieties-title">{t('varieties')}</h2>
        <div className="pokemon-tags">
          {species.varieties.map(({ pokemon: variety }) => <Link key={variety.name} to={`/pokedex/${resourceId(variety.url)}`}>{formatName(variety.name)}</Link>)}
        </div>
      </section>
      <Moves key={pokemon.id} moves={pokemon.moves} />
      <GameAppearances key={pokemon.id} games={pokemon.game_indices} sprites={pokemon.sprites} pokemonName={name} />
    </article>
  );
};

export default Pokemon;
