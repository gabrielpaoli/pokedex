import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import pokemons from '../json/pokemons';
import types from '../json/types';
import generations from '../json/generations';
import { Link } from "react-router-dom";

const Search = (props) => {
	const LIMIT = 100000;
	const [qty, setQty] = useState(24);
	const [searchData] = useState(pokemons);
	const [query, setQuery] = useState({pokemonName: '', qty: qty, filteredPokemons: []});
	const [searchTypes, setSearchTypes] = useState(types);
	const [searchGenerations, setSearchGenerations] = useState(generations);
	const pokedata = getPokemonList(searchData)

  useEffect(() => {
		updatePokemons();
	}, [searchTypes, searchGenerations]);

	function getPokemonList(searchData) {
		let data = [];
		let filterInstance = [];

		if(query.filteredPokemons.length > 0){
			filterInstance = query.filteredPokemons;
		}else{
			filterInstance = searchData;
		}

		data = filterInstance.filter(o => Object.keys(o).some(k => o[k].toLowerCase().includes(query.pokemonName.toLowerCase())))
		data = data.slice(0, query.qty);
    
		return data;
	}

	function getSelectedTypeNames(types){
		let typesArray = [];
		for (let type of types) {      
			typesArray.push(type.name);
		}
		return typesArray;
	}

	function updatePokemons(){
		let pokemons = [];
		let pokeFound = [];

		let generation = searchGenerations.find(element => element.checked)
		let types = searchTypes.filter(element => element.checked)

		if(types.length > 0){
			const typeArr = getSelectedTypeNames(types);
			pokeFound = searchData.filter(p => typeArr.includes(p.type) || typeArr.includes(p.type2));

			if(generation && generation.name !== 'all'){
				pokeFound = pokeFound.filter(p => p.generation === generation.name)
			}
		}else{
			if(generation && generation.name !== 'all'){
				pokeFound = searchData.filter(p => p.generation === generation.name)
			}
		}

		pokeFound.map((p) => {
			pokemons.push(p)
		})

		let pokemonsFiltered = pokemons.filter((value, index, self) =>
			index === self.findIndex((t) => (
				t.place === value.place && t.name === value.name
			))
		)

		pokemonsFiltered.sort((a, b) => {
			return getPokemonId(a.url) - getPokemonId(b.url);
		});

		setQuery(query => ({
			...query,
			filteredPokemons: pokemonsFiltered
		}));

	}
	
	function showMore(){
		let newQty = query.qty + qty;
		setQuery(query => ({
			...query,
			qty: newQty
		}));
	}

	function getPokemonId(url){
		var chunks = url.split('/');
		return chunks[6];
	}

	function parsePokemonName(name){
		let nameParsed = name.charAt(0).toUpperCase() + name.slice(1);
		nameParsed = nameParsed.replace('-', ' ')
		return nameParsed;
	}

	const inputHandler = (e) => {
    let searchName = e.target.value.toLowerCase().replace(' ', '-');
		setQuery(query => ({
			...query,
			pokemonName: searchName,
		}));
  };

	const handleChangeQty = (event) => {
		let newQty = event.target.value;
    setQty(newQty);
		setQuery(query => ({
			...query,
			qty: newQty
		}));
  };

	const handleChangeGeneration = (event) => {
		let newGenerationName = event.target.value;
		let newArr = [...searchGenerations];

		searchGenerations.map(function(generation, i) { 
			if(generation.checked){
				newArr[i] = {...generation, checked: false};
				setSearchGenerations(newArr);
			}
			if(generation.name === newGenerationName){
				newArr[i] = {...generation, checked: true};
				setSearchGenerations(newArr);
			}
		});
  };

	const clickType = (type, i) => {
		let newArr = [...searchTypes];
		newArr[i] = {...type, checked: !type.checked};
		setSearchTypes(newArr);
	}

	function getGenerationSelected(){
		let generation;
		if(searchGenerations.length > 0){
			searchGenerations.map(function(x) { 
				if(x.checked){
					generation = x.name;
				}
			});
		}

		return generation;
	}
	
  return (
		
		<div>
		
			<div className="search">
			<Grid container spacing={2}>

				<Grid item xs={12} sm={6}>
					<Box sx={{ minWidth: 280 }}>
						<TextField
							id="outlined-basic"
							onChange={inputHandler}
							variant="outlined"
							fullWidth
							label="Search"
							placeholder="Enter at least 3 characters"
						/>
					</Box>
				</Grid>

				<Grid item xs={12} sm={3}>
					<Box sx={{ minWidth: 140 }}>
						<FormControl fullWidth>
							<InputLabel id="generation-select-label">Generation</InputLabel>
							<Select
								labelId="generation-select-label"
								id="generation-select"
								value={getGenerationSelected()}
								label="Generation"
								onChange={handleChangeGeneration}
							>
								{searchGenerations.map((generation, i) => (
									<MenuItem key={generation.name} value={generation.name}>{generation.parsedName}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</Grid>


				<Grid item xs={12} sm={3}>
					<Box sx={{ minWidth: 140 }}>
						<FormControl fullWidth>
							<InputLabel id="qty-select-label">Show</InputLabel>
							<Select
								labelId="qty-select-label"
								id="qty-select"
								value={qty}
								label="Age"
								onChange={handleChangeQty}
							>
								<MenuItem value={12}>12</MenuItem>
								<MenuItem value={24}>24</MenuItem>
								<MenuItem value={36}>36</MenuItem>
								<MenuItem value={72}>72</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Grid>
			</Grid>

			<div className='searchCategories'>
				<Grid container spacing={2}>

					{searchTypes.map((type, i) => (
						<Grid item xs={4} lg={1} key={type+"-"+i}>
							<Button className={`background-color-${type.name}`} fullWidth
								sx={{ 
									color: 'white', 
									className: 'background-color-' + type.name,
									border: type.checked ? '2px dashed black' : '2px solid transparent'
								}}
									onClick={ () => clickType(type, i) }
							>
								{type.name}
							</Button>
						</Grid>
					))
					}

				</Grid>
			</div>


      </div>

			<Grid container>
				{pokedata.map((pokemon, i) => (
					<Grid 
						item xs={12} sm={4} md={2} 
						className="pokemon-block" 
						key={i}
						container
						direction="row"
						alignItems="flex-end"
						justify="center"
						align="center"
					>
						<Link to={'/pokedex/' + getPokemonId(pokemon.url)} className="containerPokemonCard">
							<img alt={pokemon.name} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokemonId(pokemon.url)}.png`} /> 
							<Typography>{parsePokemonName(pokemon.name)}</Typography>
							<Typography>#{getPokemonId(pokemon.url)}</Typography>

							<Grid 
								key={pokemon.type+"-"+i}
								container
								direction="row"
								align="center"
								justify="center"
							>
							
							<Grid sx={{ pr: 0.2, pl: 0.2 }} item xs={12} lg={(pokemon.type2) ? 6 : 12}>
								<Button fullWidth className={`typeTag background-color-${pokemon.type}`}>
									{pokemon.type}
								</Button>
							</Grid>
							
							{pokemon.type2 &&
								<Grid sx={{ pr: 0.2, pl: 0.2 }} item xs={12} lg={6}>
										<Button fullWidth className={`typeTag background-color-${pokemon.type2}`}>
											{pokemon.type2}
										</Button>
								</Grid>
							}

							</Grid>
						</Link>
					</Grid>
				))}

			</Grid>

			{pokedata.length >= query.qty &&
				<Button className="showMore" onClick={showMore} fullWidth>
					Show more
				</Button> 
			}

		</div>
  );

};
	
export default Search;