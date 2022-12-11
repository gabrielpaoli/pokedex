import React, { useState, useEffect } from 'react';
import axios from "axios";
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

const Search = (props) => {
	const LIMIT = 100000;
	const [qty, setQty] = useState(24);
	const URL_TYPES = 'https://pokeapi.co/api/v2/type';
	const URL_GENERATIONS = 'https://pokeapi.co/api/v2/generation';
	const [query, setQuery] = useState({pokemonName: '', qty: qty, taggedPokemons: [], generationPokemons: [], filteredPokemons: []});
	const [searchData, setSearchData] = useState([]);
	const [searchTypes, setSearchTypes] = useState([]);
	const [searchGenerations, setSearchGenerations] = useState([]);
	const pokedata = getPokemonList(searchData)

	function getPokemonData(){
		setSearchData(pokemons);
	}


	function getTypesData(){
		let fetchPokemoTypes = async () => {
			const result = await axios(URL_TYPES);
			let data = result.data.results;
			data.map(function(x) { 
				x.checked = false; 
				return x
			});
			data.splice(data.length -2, 2);

			setSearchTypes(data);
		};

		fetchPokemoTypes();
	}

	function getGenerationsData(){
		let fetchPokemoGenerations = async () => {
			const result = await axios(URL_GENERATIONS);
			let data = result.data.results;
			data.map(function(x) { 
				x.checked = false; 
				return x
			});

			setSearchGenerations(data);
		};

		fetchPokemoGenerations();
	}

  useEffect(() => {

		if(searchData.length === 0){getPokemonData()}
		if(searchTypes.length === 0){getTypesData()}
		if(searchGenerations.length === 0){getGenerationsData()}

		updatePokemonsPerType();
		updatePokemonsPerGeneration();
	}, [searchTypes, searchGenerations]);

	function getPokemonList(searchData) {
		let data = [];
		let filterInstance = [];

		if(query.taggedPokemons.length > 0 || query.generationPokemons.length > 0){
			filterInstance = query.filteredPokemons;
		}else{
			filterInstance = searchData;
		}


		data = filterInstance.filter(o => Object.keys(o).some(k => o[k].toLowerCase().includes(query.pokemonName.toLowerCase())))
		data = data.slice(0, query.qty);
    
		return data;
	}


	function updatePokemonsPerGeneration(){
		let pokemons = [];

		let fetchPokemonData = async () => {
			for (let generation of searchGenerations) {      
				if(generation.checked){
					const result = await axios(generation.url);
					pokemons = result.data.pokemon_species;
				}
    	}

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
				generationPokemons: pokemonsFiltered
			}));


			setQuery(query => ({
				...query,
				//filteredPokemons: mixedPokemons
			}));


		};

		fetchPokemonData();
	}

	function updatePokemonsPerType(){
		let pokemons = [];

		let fetchPokemonData = async () => {
			let generation = searchGenerations.find(element => element.checked)
			
			for (let type of searchTypes) {      
				if(type.checked){
					let pokeFound = searchData.filter(p => p.type === type.name);
					if(generation){
						pokeFound = pokeFound.filter(p => p.generation === generation.name)
					}

					pokeFound.map((p) => {
						pokemons.push(p)
					})
				}
    	}

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
				taggedPokemons: pokemonsFiltered
			}));

			setQuery(query => ({
				...query,
				filteredPokemons: pokemonsFiltered
			}));

		};

		fetchPokemonData();
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
		let generation = 'generation-i';
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
									<MenuItem key={generation.name} value={generation.name}>{generation.name}</MenuItem>
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
								<MenuItem value={144}>144</MenuItem>
								<MenuItem value={288}>288</MenuItem>
								<MenuItem value={LIMIT}>All</MenuItem>
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
						<a className="containerPokemonCard" href={'pokedex/' + getPokemonId(pokemon.url)}>
							<img alt={pokemon.name} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokemonId(pokemon.url)}.png`} /> 
							<Typography>{parsePokemonName(pokemon.name)}</Typography>
							<Typography>#{getPokemonId(pokemon.url)}</Typography>
						</a>
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