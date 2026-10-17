import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import CatchingPokemon from '@mui/icons-material/CatchingPokemon';
import { useLanguage } from '../../i18n/Language';
import './Header.css';

function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/pokedex" className="site-brand" aria-label={t('pokedex')}>
          <span className="site-brand-icon"><CatchingPokemon aria-hidden="true" /></span>
          <span>Pokedex<span className="site-brand-dot">.</span></span>
        </Link>
        <nav className="site-navigation" aria-label={t('navigation')}>
          <NavLink to="/" end>{t('home')}</NavLink>
          <NavLink to="/pokedex">{t('pokedex')}</NavLink>
        </nav>
        <div className="site-language" role="group" aria-label={t('language')}>
          <span className="site-language-label">{t('language')}</span>
          <div className="site-language-options">
            <button type="button" lang="es" aria-label="Español" aria-pressed={language === 'es'} onClick={() => setLanguage('es')}>
              <span className="language-short">ES</span><span className="language-full">Español</span>
            </button>
            <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>
              <span className="language-short">EN</span><span className="language-full">English</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
