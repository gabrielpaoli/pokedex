import React, { createContext, useContext, useEffect, useState } from 'react';

export const formatName = (name) => name.replace(/[-_]/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());

const messages = {
  en: {
    navigation: 'Main navigation',
    currentPokemon: 'Current Pokemon', evolutionNote: 'Follow the evolution path. Select a Pokemon to explore its details.',
    movesNote: 'Type and category icons identify each move. PokeAPI does not provide individual move artwork.',
    gamesNote: 'Recorded editions, illustrated with this Pokemon\'s in-game sprite when available. Cartridge illustrations are decorative, not official box art.',
    gameEdition: 'Game edition', inGameSprite: 'In-game sprite', gameImageUnavailable: 'Edition sprite unavailable',
    home: 'Home', pokedex: 'Pokedex', language: 'Language', menu: 'Open navigation',
    search: 'Search', searchPlaceholder: 'Search by Pokemon name', generation: 'Generation',
    quantity: 'Quantity', all: 'All', showMore: 'Show more', footer: 'Pokemon data provided by PokeAPI.',
    welcome: 'Explore the Pokedex', intro: 'Find Pokemon and discover their stats, moves and evolutions.',
    back: 'Back to the Pokedex', retry: 'Retry', loading: 'Loading Pokemon...',
    notFound: 'Pokemon not found.', loadError: 'Could not load the Pokemon. Please try again.',
    evolutionError: 'Could not load evolutions.', loadingEvolutions: 'Loading evolutions...',
    noEvolutions: 'No evolution data available.', doesNotEvolve: 'This Pokemon does not evolve.',
    imageUnavailable: 'Image unavailable.', descriptionUnavailable: 'Description unavailable in this language.',
    unavailable: 'Not available', information: 'General information', height: 'Height', weight: 'Weight',
    experience: 'Base experience', habitat: 'Habitat', capture: 'Catch rate (0-255)',
    happiness: 'Base happiness', growth: 'Growth rate', eggGroups: 'Egg groups', gender: 'Gender',
    genderless: 'Genderless', female: 'female', male: 'male', classification: 'Classification',
    mythical: 'Mythical', legendary: 'Legendary', normal: 'Normal', abilities: 'Abilities', hidden: 'hidden',
    stats: 'Base stats', hp: 'HP', attack: 'Attack', defense: 'Defense', 'special-attack': 'Special attack',
    'special-defense': 'Special defense', speed: 'Speed', total: 'Total', evolutions: 'Evolutions',
    sprites: 'Sprites and shiny variants', front: 'Front', backSprite: 'Back', shinyFront: 'Shiny front',
    shinyBack: 'Shiny back', noSprites: 'No sprites available.', varieties: 'Varieties and forms',
    moves: 'Moves', noMoves: 'No moves available.', games: 'Game appearances', noGames: 'No games recorded.',
    loadingDetails: 'Loading details...', detailsError: 'Could not load these details.',
    power: 'Power', accuracy: 'Accuracy', damageClass: 'Category', effect: 'Effect', type: 'Type',
    yes: 'Yes', no: 'No', or: 'or', evolvesInto: 'Evolves into', level: 'Level',
    trigger: 'Trigger', min_level: 'Minimum level', item: 'Item', held_item: 'Held item',
    known_move: 'Known move', known_move_type: 'Known move type', location: 'Location',
    min_happiness: 'Minimum happiness', min_beauty: 'Minimum beauty', min_affection: 'Minimum affection',
    needs_overworld_rain: 'Requires rain', party_species: 'Pokemon in party', party_type: 'Type in party',
    relative_physical_stats: 'Attack / Defense', time_of_day: 'Time of day',
    trade_species: 'Trade Pokemon', turn_upside_down: 'Turn upside down',
    'level-up': 'Level up', 'use-item': 'Use item', trade: 'Trade', shed: 'Empty party slot',
    spin: 'Spin', 'tower-of-darkness': 'Tower of Darkness', 'tower-of-waters': 'Tower of Waters',
    'three-critical-hits': 'Three critical hits', 'take-damage': 'Take damage',
    other: 'Special condition', 'agile-style-move': 'Agile style move', 'strong-style-move': 'Strong style move',
    'recoil-damage': 'Recoil damage', day: 'Day', night: 'Night', dusk: 'Dusk',
    physical: 'Physical', special: 'Special', status: 'Status',
    attackHigher: 'Attack > Defense', defenseHigher: 'Attack < Defense', statsEqual: 'Attack = Defense',
    version_group: 'Games', region: 'Region', min_steps: 'Minimum steps', min_damage_taken: 'Minimum damage taken',
  },
  es: {
    navigation: 'Navegacion principal',
    currentPokemon: 'Pokemon actual', evolutionNote: 'Sigue la cadena evolutiva. Selecciona un Pokemon para ver su ficha.',
    movesNote: 'Los iconos indican el tipo y la categoria. PokeAPI no ofrece ilustraciones individuales de cada movimiento.',
    gamesNote: 'Ediciones registradas, ilustradas con el sprite del Pokemon en ese juego cuando esta disponible. Los cartuchos son decorativos, no portadas oficiales.',
    gameEdition: 'Edicion del juego', inGameSprite: 'Sprite del juego', gameImageUnavailable: 'Sprite de esta edicion no disponible',
    home: 'Inicio', pokedex: 'Pokedex', language: 'Idioma', menu: 'Abrir navegacion',
    search: 'Buscar', searchPlaceholder: 'Buscar por nombre de Pokemon', generation: 'Generacion',
    quantity: 'Cantidad', all: 'Todas', showMore: 'Mostrar mas', footer: 'Datos de Pokemon proporcionados por PokeAPI.',
    welcome: 'Explora la Pokedex', intro: 'Busca Pokemon y descubre sus estadisticas, movimientos y evoluciones.',
    back: 'Volver a la Pokedex', retry: 'Reintentar', loading: 'Cargando Pokemon...',
    notFound: 'No se encontro el Pokemon.', loadError: 'No se pudo cargar el Pokemon. Intenta nuevamente.',
    evolutionError: 'No se pudieron cargar las evoluciones.', loadingEvolutions: 'Cargando evoluciones...',
    noEvolutions: 'No hay datos de evoluciones disponibles.', doesNotEvolve: 'Este Pokemon no evoluciona.',
    imageUnavailable: 'Imagen no disponible.', descriptionUnavailable: 'Descripcion no disponible en este idioma.',
    unavailable: 'No disponible', information: 'Informacion general', height: 'Altura', weight: 'Peso',
    experience: 'Experiencia base', habitat: 'Habitat', capture: 'Captura (0-255)',
    happiness: 'Felicidad base', growth: 'Crecimiento', eggGroups: 'Grupos huevo', gender: 'Sexo',
    genderless: 'Sin genero', female: 'hembra', male: 'macho', classification: 'Clasificacion',
    mythical: 'Mitico', legendary: 'Legendario', normal: 'Normal', abilities: 'Habilidades', hidden: 'oculta',
    stats: 'Estadisticas base', hp: 'PS', attack: 'Ataque', defense: 'Defensa', 'special-attack': 'Ataque especial',
    'special-defense': 'Defensa especial', speed: 'Velocidad', total: 'Total', evolutions: 'Evoluciones',
    sprites: 'Sprites y version shiny', front: 'Frente', backSprite: 'Espalda', shinyFront: 'Shiny de frente',
    shinyBack: 'Shiny de espalda', noSprites: 'No hay sprites disponibles.', varieties: 'Variedades y formas',
    moves: 'Movimientos', noMoves: 'No hay movimientos disponibles.', games: 'Apariciones en juegos',
    noGames: 'No hay juegos registrados.', loadingDetails: 'Cargando detalles...',
    detailsError: 'No se pudieron cargar estos detalles.', power: 'Potencia', accuracy: 'Precision',
    damageClass: 'Categoria', effect: 'Efecto', type: 'Tipo', yes: 'Si', no: 'No', or: 'o', evolvesInto: 'Evoluciona a',
    level: 'Nivel', trigger: 'Metodo', min_level: 'Nivel minimo', item: 'Objeto', held_item: 'Objeto equipado',
    known_move: 'Movimiento conocido', known_move_type: 'Tipo de movimiento conocido', location: 'Lugar',
    min_happiness: 'Felicidad minima', min_beauty: 'Belleza minima', min_affection: 'Afecto minimo',
    needs_overworld_rain: 'Requiere lluvia', party_species: 'Pokemon en el equipo', party_type: 'Tipo en el equipo',
    relative_physical_stats: 'Ataque / Defensa', time_of_day: 'Momento del dia',
    trade_species: 'Pokemon intercambiado', turn_upside_down: 'Girar boca abajo',
    'level-up': 'Subir de nivel', 'use-item': 'Usar objeto', trade: 'Intercambio', shed: 'Espacio libre en el equipo',
    spin: 'Girar', 'tower-of-darkness': 'Torre de las Sombras', 'tower-of-waters': 'Torre de las Aguas',
    'three-critical-hits': 'Tres golpes criticos', 'take-damage': 'Recibir dano',
    other: 'Condicion especial', 'agile-style-move': 'Movimiento en estilo rapido',
    'strong-style-move': 'Movimiento en estilo fuerte', 'recoil-damage': 'Dano de retroceso',
    day: 'Dia', night: 'Noche', dusk: 'Atardecer', physical: 'Fisico', special: 'Especial', status: 'Estado',
    attackHigher: 'Ataque > Defensa', defenseHigher: 'Ataque < Defensa', statsEqual: 'Ataque = Defensa',
    version_group: 'Juegos', region: 'Region', min_steps: 'Pasos minimos', min_damage_taken: 'Dano recibido minimo',
  },
};

const spanishTerms = {
  normal: 'Normal', fighting: 'Lucha', flying: 'Volador', poison: 'Veneno', ground: 'Tierra',
  rock: 'Roca', bug: 'Bicho', ghost: 'Fantasma', steel: 'Acero', fire: 'Fuego', water: 'Agua',
  grass: 'Planta', electric: 'Electrico', psychic: 'Psiquico', ice: 'Hielo', dragon: 'Dragon',
  dark: 'Siniestro', fairy: 'Hada', unknown: 'Desconocido', stellar: 'Astral',
  cave: 'Cueva', forest: 'Bosque', grassland: 'Pradera', mountain: 'Montana', rare: 'Raro',
  'rough-terrain': 'Terreno agreste', sea: 'Mar', urban: 'Urbano', 'waters-edge': 'Orilla',
  slow: 'Lento', medium: 'Medio', fast: 'Rapido', 'medium-slow': 'Medio lento',
  'slow-then-very-fast': 'Erratico', 'fast-then-very-slow': 'Fluctuante',
  monster: 'Monstruo', 'water1': 'Agua 1', 'water2': 'Agua 2', 'water3': 'Agua 3',
  mineral: 'Mineral', plant: 'Planta', 'no-eggs': 'No descubierto', ditto: 'Ditto',
  'humanshape': 'Humanoide', 'indeterminate': 'Amorfo',
  red: 'Rojo', blue: 'Azul', yellow: 'Amarillo', gold: 'Oro', silver: 'Plata',
  crystal: 'Cristal', ruby: 'Rubi', sapphire: 'Zafiro', emerald: 'Esmeralda',
  firered: 'Rojo Fuego', leafgreen: 'Verde Hoja', diamond: 'Diamante', pearl: 'Perla',
  platinum: 'Platino', heartgold: 'Oro HeartGold', soulsilver: 'Plata SoulSilver',
  black: 'Negro', white: 'Blanco', 'black-2': 'Negro 2', 'white-2': 'Blanco 2',
  'omega-ruby': 'Rubi Omega', 'alpha-sapphire': 'Zafiro Alfa', sun: 'Sol', moon: 'Luna',
  'ultra-sun': 'Ultrasol', 'ultra-moon': 'Ultraluna', 'lets-go-pikachu': "Let's Go Pikachu",
  'lets-go-eevee': "Let's Go Eevee", sword: 'Espada', shield: 'Escudo',
  'brilliant-diamond': 'Diamante Brillante', 'shining-pearl': 'Perla Reluciente',
  'legends-arceus': 'Leyendas Arceus', scarlet: 'Escarlata', violet: 'Purpura',
  'red-blue': 'Rojo y Azul', 'gold-silver': 'Oro y Plata', 'ruby-sapphire': 'Rubi y Zafiro',
  'firered-leafgreen': 'Rojo Fuego y Verde Hoja', 'diamond-pearl': 'Diamante y Perla',
  'heartgold-soulsilver': 'HeartGold y SoulSilver', 'black-white': 'Negro y Blanco',
  'black-2-white-2': 'Negro 2 y Blanco 2', 'omega-ruby-alpha-sapphire': 'Rubi Omega y Zafiro Alfa',
  'sun-moon': 'Sol y Luna', 'ultra-sun-ultra-moon': 'Ultrasol y Ultraluna',
  'sword-shield': 'Espada y Escudo', 'scarlet-violet': 'Escarlata y Purpura',
};

export function localized(entries = [], language) {
  return entries.find((entry) => entry.language.name === language);
}

function translator(language) {
  return (key) => {
    if (key.startsWith('generation-')) return `${messages[language].generation} ${key.slice(11).toUpperCase()}`;
    return messages[language][key] || (language === 'es' && spanishTerms[key]) || formatName(key);
  };
}

const LanguageContext = createContext({ language: 'es', t: translator('es') });

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('pokedex-language');
      if (saved === 'es' || saved === 'en') return saved;
    } catch (error) {
      console.warn('Could not read the saved language preference.', error);
    }
    return navigator.language?.startsWith('es') ? 'es' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem('pokedex-language', language);
    } catch (error) {
      console.warn('Could not save the language preference.', error);
    }
  }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage, t: translator(language) }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
