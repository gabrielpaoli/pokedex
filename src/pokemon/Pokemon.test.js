import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Pokemon from './Pokemon';

jest.mock('axios', () => jest.fn());

const api = 'https://pokeapi.co/api/v2';
const speciesUrl = `${api}/pokemon-species/1/`;
const chainUrl = `${api}/evolution-chain/1/`;
const resource = (name) => ({ name });
const pokemon = {
  id: 1,
  name: 'bulbasaur',
  species: { name: 'bulbasaur', url: speciesUrl },
  height: 7,
  weight: 69,
  base_experience: 64,
  sprites: {
    front_default: '/front.png',
    front_shiny: '/shiny.png',
    other: { 'official-artwork': { front_default: '/artwork.png' } },
  },
  types: [{ type: resource('grass') }, { type: resource('poison') }],
  abilities: [{ ability: resource('overgrow'), is_hidden: false }, { ability: resource('chlorophyll'), is_hidden: true }],
  stats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((name) => ({
    stat: resource(name), base_stat: 45, effort: 0,
  })),
  moves: [{ move: resource('tackle') }],
  game_indices: [{ version: resource('red') }],
};
const species = {
  flavor_text_entries: [
    { language: resource('en'), flavor_text: 'English description' },
    { language: resource('es'), flavor_text: 'Una semilla\nespecial.' },
  ],
  genera: [{ language: resource('es'), genus: 'Pokemon Semilla' }],
  generation: resource('generation-i'),
  habitat: resource('grassland'),
  growth_rate: resource('medium-slow'),
  egg_groups: [resource('monster')],
  capture_rate: 45,
  base_happiness: 50,
  gender_rate: 1,
  is_mythical: false,
  is_legendary: false,
  evolution_chain: { url: chainUrl },
  varieties: [{ is_default: true, pokemon: { name: 'bulbasaur', url: `${api}/pokemon/1/` } }],
};
const node = (name, url, children = [], details = []) => ({
  species: { name, url }, evolves_to: children, evolution_details: details,
});

function mockApi(overrides = {}) {
  const responses = {
    [`${api}/pokemon/1`]: pokemon,
    [speciesUrl]: species,
    [chainUrl]: { chain: node('bulbasaur', speciesUrl) },
    ...overrides,
  };
  axios.mockImplementation((url) => {
    const response = responses[url];
    if (response instanceof Error) return Promise.reject(response);
    if (!response) return Promise.reject(new Error(`Unexpected URL: ${url}`));
    return Promise.resolve({ data: response });
  });
}

function renderPokemon() {
  return render(
    <MemoryRouter initialEntries={['/pokedex/1']}>
      <Routes><Route path="/pokedex/:id" element={<Pokemon />} /></Routes>
    </MemoryRouter>
  );
}

beforeEach(() => jest.resetAllMocks());

test('renders artwork, localized information, stats, abilities, sprites and moves', async () => {
  mockApi();
  renderPokemon();
  expect(screen.getByRole('status')).toHaveTextContent('Cargando Pokemon');
  expect(await screen.findByRole('heading', { name: 'Bulbasaur #001' })).toBeInTheDocument();
  expect(screen.getAllByAltText('Bulbasaur')[0]).toHaveAttribute('src', '/artwork.png');
  expect(screen.getByText('Una semilla especial.')).toBeInTheDocument();
  expect(screen.getByText('0.7 m')).toBeInTheDocument();
  expect(screen.getByText('6.9 kg')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Chlorophyll.*oculta/ })).toBeInTheDocument();
  expect(screen.getByText('270')).toBeInTheDocument();
  ['PS', 'Ataque', 'Defensa', 'Ataque especial', 'Defensa especial', 'Velocidad'].forEach((label) => {
    expect(screen.getByRole('meter', { name: label })).toHaveAttribute('aria-valuenow', '45');
    expect(screen.getByRole('meter', { name: label })).toHaveAttribute('aria-valuemax', '255');
  });
  expect(screen.getByAltText('Bulbasaur: Shiny de frente')).toHaveAttribute('src', '/shiny.png');
  fireEvent.click(screen.getByText('Movimientos'));
  expect(await screen.findByText('Tackle')).toBeVisible();
  expect(await screen.findByText('Este Pokemon no evoluciona.')).toBeInTheDocument();
});

test('renders all evolution branches and uses default variety IDs instead of species IDs', async () => {
  const branchUrl = `${api}/pokemon-species/2/`;
  const secondBranchUrl = `${api}/pokemon-species/3/`;
  mockApi({
    [chainUrl]: { chain: node('bulbasaur', speciesUrl, [
      node('ivysaur', branchUrl, [], [{ trigger: resource('level-up'), min_level: 16 }]),
      node('venusaur', secondBranchUrl),
    ]) },
    [branchUrl]: { varieties: [{ is_default: true, pokemon: { url: `${api}/pokemon/10002/` } }] },
    [secondBranchUrl]: { varieties: [{ is_default: true, pokemon: { url: `${api}/pokemon/3/` } }] },
  });
  renderPokemon();
  expect(await screen.findByRole('link', { name: /Ivysaur #10002/ })).toHaveAttribute('href', '/pokedex/10002');
  expect(screen.getByRole('link', { name: /Venusaur #003/ })).toHaveAttribute('href', '/pokedex/3');
  expect(screen.getByText(/Nivel minimo: 16/)).toBeInTheDocument();
});

test('fetches new data when navigating to a different Pokemon without remounting', async () => {
  const nextSpeciesUrl = `${api}/pokemon-species/2/`;
  mockApi({
    [speciesUrl]: { ...species, varieties: [
      ...species.varieties,
      { is_default: false, pokemon: { name: 'ivysaur', url: `${api}/pokemon/2/` } },
    ] },
    [`${api}/pokemon/2`]: { ...pokemon, id: 2, name: 'ivysaur', species: { url: nextSpeciesUrl } },
    [nextSpeciesUrl]: { ...species, evolution_chain: null },
  });
  let resolvePokemon;
  axios.mockImplementationOnce(() => new Promise((resolve) => { resolvePokemon = resolve; }));
  renderPokemon();
  await act(async () => { resolvePokemon({ data: pokemon }); });
  await screen.findByRole('heading', { name: 'Bulbasaur #001' });
  await screen.findByText('Este Pokemon no evoluciona.');
  fireEvent.click(screen.getByRole('link', { name: 'Ivysaur' }));
  expect(await screen.findByRole('heading', { name: 'Ivysaur #002' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Bulbasaur #001' })).not.toBeInTheDocument();
});

test('reports missing Pokemon and allows retrying failed requests', async () => {
  const notFound = Object.assign(new Error('Not found'), { response: { status: 404 } });
  mockApi({ [`${api}/pokemon/1`]: notFound });
  renderPokemon();
  expect(await screen.findByRole('alert')).toHaveTextContent('No se encontro');
  mockApi();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { name: 'Bulbasaur #001' })).toBeInTheDocument();
});

test('keeps basic data visible when evolution requests fail', async () => {
  mockApi({ [chainUrl]: new Error('Network error') });
  renderPokemon();
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las evoluciones');
  expect(screen.getByRole('heading', { name: 'Bulbasaur #001' })).toBeInTheDocument();
});

test('handles missing optional data without mixing description languages and uses the default sprite', async () => {
  mockApi({
    [`${api}/pokemon/1`]: { ...pokemon, sprites: { front_default: '/front.png' }, base_experience: null },
    [speciesUrl]: {
      ...species,
      flavor_text_entries: [species.flavor_text_entries[0]],
      genera: [],
      habitat: null,
      gender_rate: -1,
      evolution_chain: null,
    },
  });
  renderPokemon();
  expect((await screen.findAllByText('Descripcion no disponible en este idioma.')).length).toBeGreaterThan(0);
  expect(screen.queryByText('English description')).not.toBeInTheDocument();
  expect(screen.getByAltText('Bulbasaur')).toHaveAttribute('src', '/front.png');
  expect(screen.getByText('Sin genero')).toBeInTheDocument();
  expect(screen.getByText('No hay datos de evoluciones disponibles.')).toBeInTheDocument();
});

test('aborts requests when the detail page is unmounted', async () => {
  mockApi();
  const { unmount } = renderPokemon();
  await screen.findByRole('heading', { name: 'Bulbasaur #001' });
  const signal = axios.mock.calls[0][1].signal;
  unmount();
  await waitFor(() => expect(signal.aborted).toBe(true));
});
