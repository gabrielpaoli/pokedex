import React from 'react';
import Bolt from '@mui/icons-material/Bolt';
import LocalFireDepartment from '@mui/icons-material/LocalFireDepartment';
import Opacity from '@mui/icons-material/Opacity';
import Grass from '@mui/icons-material/Grass';
import AcUnit from '@mui/icons-material/AcUnit';
import BugReport from '@mui/icons-material/BugReport';
import Air from '@mui/icons-material/Air';
import Terrain from '@mui/icons-material/Terrain';
import Landscape from '@mui/icons-material/Landscape';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import Science from '@mui/icons-material/Science';
import Visibility from '@mui/icons-material/Visibility';
import DarkMode from '@mui/icons-material/DarkMode';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Shield from '@mui/icons-material/Shield';
import CatchingPokemon from '@mui/icons-material/CatchingPokemon';
import { useLanguage } from '../i18n/Language';
import './TypeBadge.css';

const icons = {
  fire: LocalFireDepartment, water: Opacity, grass: Grass, electric: Bolt,
  ice: AcUnit, bug: BugReport, flying: Air, ground: Terrain, rock: Landscape,
  fighting: FitnessCenter, poison: Science, psychic: Visibility, dark: DarkMode,
  fairy: AutoAwesome, steel: Shield, ghost: DarkMode, dragon: AutoAwesome,
};

export default function TypeBadge({ type, onClick, selected = false }) {
  const { t } = useLanguage();
  const Icon = icons[type] || CatchingPokemon;
  const content = <><Icon aria-hidden="true" fontSize="small" />{t(type)}</>;
  const className = `pokemon-type background-color-${type}`;
  return onClick
    ? <button type="button" className={`${className} pokemon-type-filter`} aria-pressed={selected} onClick={onClick}>{content}</button>
    : <span className={className}>{content}</span>;
}
