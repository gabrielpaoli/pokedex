import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from "axios";

const Pokemon = (props) => {
  let { id } = useParams();
	const URL_POKEMON = `https://pokeapi.co/api/v2/pokemon/${id}`
	const [pokemon, setPokemon] = useState([]);
	const [type, setType] = useState([]);

  useEffect(() => {
		let data = [];
    let fetchData = async () => {
      const polemonData = await axios(URL_POKEMON);
      const typeData = await axios(polemonData.data.types[0].type.url);
			setPokemon(polemonData.data);
			setType(typeData.data);
    };
    fetchData();
  }, []);

  return (
    <div>
        {console.log(type)}
    </div>
      
  );

};
	
export default Pokemon;