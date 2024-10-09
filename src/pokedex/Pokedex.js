import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import pokemons from '../json/pokemons';
import types from '../json/types';
import qtyList from '../json/qtyList';
import generations from '../json/generations';
import PokeCard from './PokeCard';
import FormInput from '../search/FormInput';
import FormSelect from '../search/FormSelect';
import FormTypes from '../search/FormTypes';

const Search = (props) => {
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
		
		<div className="pokedex-search">
			<div className="search">
				<Grid container spacing={2}>

					<Grid item xs={12} sm={6}>
						<Box sx={{ minWidth: 280 }}>
							<FormInput  
								inputHandler={inputHandler}
							/>
						</Box>
					</Grid>

					<Grid item xs={12} sm={3}>
						<Box sx={{ minWidth: 140 }}>
							<FormSelect label="Generation" id="generation" handle={handleChangeGeneration} value={getGenerationSelected()} menuItemIterator={searchGenerations} />
						</Box>
					</Grid>

					<Grid item xs={12} sm={3}>
						<Box sx={{ minWidth: 140 }}>
							<FormSelect label="Qty" id="qty" handle={handleChangeQty} value={qty} menuItemIterator={qtyList} />
						</Box>
					</Grid>
				</Grid>

				<div className='searchCategories'>
					<FormTypes searchTypes={searchTypes} clickType={clickType} />
				</div>

      </div>

			<Grid container>
				{pokedata.map((pokemon, i) => (
					<Grid item xs={12} sm={4} md={2} className="pokemon-block"  key={i} container direction="row" alignItems="flex-end" justify="center" align="center">
						<PokeCard pokemon={pokemon} pokemonId={getPokemonId(pokemon.url)} i={i} />
					</Grid>
				))}
			</Grid>

			{pokedata.length >= query.qty &&
				<Button className="showMore" onClick={showMore} fullWidth>Show more</Button> 
			}

		</div>
  );

};
	
export default Search;