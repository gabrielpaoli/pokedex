import React from 'react';
import Grass from '@mui/icons-material/Grass';
import LocalFireDepartment from '@mui/icons-material/LocalFireDepartment';
import Opacity from '@mui/icons-material/Opacity';
import Bolt from '@mui/icons-material/Bolt';
import Visibility from '@mui/icons-material/Visibility';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import DarkMode from '@mui/icons-material/DarkMode';
import Shield from '@mui/icons-material/Shield';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Star from '@mui/icons-material/Star';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { useLanguage } from '../i18n/Language';

const energies = [
  { key: 'grass', names: ['grass', 'planta'], Icon: Grass },
  { key: 'fire', names: ['fire', 'fuego'], Icon: LocalFireDepartment },
  { key: 'water', names: ['water', 'agua'], Icon: Opacity },
  { key: 'electric', names: ['lightning', 'electric', 'electrica', 'electrico', 'rayo'], Icon: Bolt },
  { key: 'psychic', names: ['psychic', 'psiquico', 'psiquica'], Icon: Visibility },
  { key: 'fighting', names: ['fighting', 'lucha'], Icon: FitnessCenter },
  { key: 'dark', names: ['darkness', 'dark', 'oscura', 'oscuridad', 'siniestro'], Icon: DarkMode },
  { key: 'steel', names: ['metal', 'steel', 'acero', 'metalica'], Icon: Shield },
  { key: 'fairy', names: ['fairy', 'hada'], Icon: AutoAwesome },
  { key: 'dragon', names: ['dragon'], Icon: AutoAwesome },
  { key: 'colorless', names: ['colorless', 'incolora', 'incoloro'], Icon: Star },
];

export default function EnergyIcon({ type }) {
  const { t } = useLanguage();
  const normalized = type.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const energy = energies.find(({ names }) => names.includes(normalized));
  const Icon = energy?.Icon || HelpOutline;
  const label = energy ? t(energy.key) : type;

  return <span className={`card-energy card-energy-${energy?.key || 'unknown'}`} role="img" aria-label={label} title={label}>
    <Icon aria-hidden="true" />
  </span>;
}
