import React, { useState } from 'react';
import SportsEsports from '@mui/icons-material/SportsEsports';
import { useLanguage } from '../i18n/Language';

const editions = {
  red: ['generation-i/red-blue', 'Game Boy', '#c64747'],
  blue: ['generation-i/red-blue', 'Game Boy', '#4268be'],
  yellow: ['generation-i/yellow', 'Game Boy', '#c49314'],
  gold: ['generation-ii/gold', 'Game Boy Color', '#ad842b'],
  silver: ['generation-ii/silver', 'Game Boy Color', '#71829a'],
  crystal: ['generation-ii/crystal', 'Game Boy Color', '#2299a7'],
  ruby: ['generation-iii/ruby-sapphire', 'Game Boy Advance', '#b83f59'],
  sapphire: ['generation-iii/ruby-sapphire', 'Game Boy Advance', '#425fbd'],
  emerald: ['generation-iii/emerald', 'Game Boy Advance', '#238968'],
  firered: ['generation-iii/firered-leafgreen', 'Game Boy Advance', '#ce6530'],
  leafgreen: ['generation-iii/firered-leafgreen', 'Game Boy Advance', '#4e913c'],
  diamond: ['generation-iv/diamond-pearl', 'Nintendo DS', '#627db3'],
  pearl: ['generation-iv/diamond-pearl', 'Nintendo DS', '#ad6f9b'],
  platinum: ['generation-iv/platinum', 'Nintendo DS', '#687482'],
  heartgold: ['generation-iv/heartgold-soulsilver', 'Nintendo DS', '#ad842b'],
  soulsilver: ['generation-iv/heartgold-soulsilver', 'Nintendo DS', '#71829a'],
  black: ['generation-v/black-white', 'Nintendo DS', '#434b5d'],
  white: ['generation-v/black-white', 'Nintendo DS', '#788396'],
  'black-2': ['generation-v/black-white', 'Nintendo DS', '#434b5d'],
  'white-2': ['generation-v/black-white', 'Nintendo DS', '#788396'],
};

function GameCard({ version, sprites, pokemonName }) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState(false);
  const edition = editions[version.name];
  const [generation, group] = edition?.[0].split('/') || [];
  const sprite = generation && sprites.versions?.[generation]?.[group]?.front_default;

  return (
    <li className="pokemon-game-card" style={{ '--edition-color': edition?.[2] || '#5965a8' }}>
      <div className="pokemon-game-art">
        <div className="pokemon-cartridge" aria-hidden="true">
          <span className="cartridge-ridges" />
          <div className="cartridge-label">
            {sprite && !failed
              ? <img src={sprite} alt="" loading="lazy" onError={() => setFailed(true)} />
              : <SportsEsports />}
          </div>
          <span className="cartridge-notch" />
        </div>
      </div>
      <div className="pokemon-game-info">
        <span className="pokemon-eyebrow">{edition?.[1] || t('gameEdition')}</span>
        <h3>Pokemon {t(version.name)}</h3>
        <p>{sprite && !failed ? `${pokemonName} · ${t('inGameSprite')}` : t('gameImageUnavailable')}</p>
      </div>
    </li>
  );
}

export default function GameAppearances({ games, sprites, pokemonName }) {
  const { t } = useLanguage();
  return (
    <details className="pokemon-panel pokemon-disclosure">
      <summary><span>{t('games')}</span><span className="pokemon-count">{games.length}</span></summary>
      <p className="pokemon-section-note">{t('gamesNote')}</p>
      <ul className="pokemon-games">
        {games.map(({ version }) => <GameCard key={version.name} version={version} sprites={sprites} pokemonName={pokemonName} />)}
      </ul>
      {games.length === 0 && <p>{t('noGames')}</p>}
    </details>
  );
}
