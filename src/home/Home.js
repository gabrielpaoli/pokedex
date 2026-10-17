import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/Language';

const Home = (props) => {
  const { t } = useLanguage();
  return (
    <div>
        <h1>{t('welcome')}</h1>
        <p>{t('intro')}</p>
        <Link to="/pokedex">{t('pokedex')}</Link>
    </div>
      
  );

};
	
export default Home;