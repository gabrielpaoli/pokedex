import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

const PokeCard = (props) => {

	
	function parsePokemonName(name){
		let nameParsed = name.charAt(0).toUpperCase() + name.slice(1);
		nameParsed = nameParsed.replace('-', ' ')
		return nameParsed;
	}

    return (
			<Link to={'/pokedex/' + props.pokemonId } className="containerPokemonCard">
				<img alt={props.pokemon.name} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.pokemonId}.png`} /> 
				<Typography>{parsePokemonName(props.pokemon.name)}</Typography>
				<Typography>#{props.pokemonId}</Typography>

				<Grid 
					key={props.pokemon.type+"-"+props.i}
					container
					direction="row"
					align="center"
					justify="center"
				>
				
				<Grid sx={{ pr: 0.2, pl: 0.2 }} item xs={12} lg={(props.pokemon.type2) ? 6 : 12}>
					<Button fullWidth className={`typeTag background-color-${props.pokemon.type}`}>
						{props.pokemon.type}
					</Button>
				</Grid>
				
				{props.pokemon.type2 &&
					<Grid sx={{ pr: 0.2, pl: 0.2 }} item xs={12} lg={6}>
							<Button fullWidth className={`typeTag background-color-${props.pokemon.type2}`}>
								{props.pokemon.type2}
							</Button>
					</Grid>
				}

				</Grid>
			</Link>
	  );

};
	
export default PokeCard;