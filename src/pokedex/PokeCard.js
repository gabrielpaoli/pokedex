import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { formatName } from '../i18n/Language';
import TypeBadge from '../pokemon/TypeBadge';

const PokeCard = ({ pokemon, pokemonId }) => (
  <Link to={`/pokedex/${pokemonId}`} className="containerPokemonCard">
    <img alt={pokemon.name} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`} />
    <Typography className="pokemon-card-name">{formatName(pokemon.name)}</Typography>
    <Typography>#{pokemonId}</Typography>
    <div className="pokemon-card-types">
      <TypeBadge type={pokemon.type} />
      {pokemon.type2 && <TypeBadge type={pokemon.type2} />}
    </div>
  </Link>
);

export default PokeCard;
