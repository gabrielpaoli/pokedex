import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { LanguageProvider, useLanguage } from '../i18n/Language';
import Card from './Card';
import PokemonCards from '../pokemon/PokemonCards';

jest.mock('axios', () => jest.fn());

const api = 'https://api.tcgdex.net/v2';
const card = {
  id: 'base1-4', name: 'Charizard', image: 'https://assets.tcgdex.net/en/base/base1/4',
  localId: '4', category: 'Pokemon', rarity: 'Rare', illustrator: 'Mitsuhiro Arita',
  set: { name: 'Base Set', cardCount: { official: 102 } }, description: 'Card description',
  dexId: [6], hp: 120, types: ['Fire'], stage: 'Stage2', evolveFrom: 'Charmeleon',
  retreat: 0, regulationMark: 'D',
  abilities: [{ name: 'Energy Burn', type: 'Pokemon Power', effect: 'Ability effect' }],
  attacks: [{ name: 'Fire Spin', cost: ['Fire', 'Fire'], damage: '100+', effect: 'Attack effect' }],
  weaknesses: [{ type: 'Water', value: 'x2' }], resistances: [{ type: 'Fighting', value: '-30' }],
  variants: { normal: false, holo: true }, legal: { standard: false, expanded: true },
};

function LanguageButton() {
  const { setLanguage } = useLanguage();
  return <button onClick={() => setLanguage('en')}>English</button>;
}

function renderCard(path = '/cards/base1-4', localized = false) {
  const ui = <MemoryRouter initialEntries={[path]}>
    {localized && <LanguageButton />}
    <Link to="/cards/next">Next card</Link>
    <Routes>
      <Route path="/cards/:id" element={<Card />} />
      <Route path="/pokemon" element={<PokemonCards speciesId="6" />} />
      <Route path="/pokedex/:id" element={<h1>Pokemon destination</h1>} />
    </Routes>
  </MemoryRouter>;
  return render(localized ? <LanguageProvider>{ui}</LanguageProvider> : ui);
}

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  axios.mockResolvedValue({ data: card });
});

afterEach(() => jest.restoreAllMocks());

test('loads direct card URLs and shows metadata, image, abilities, attacks and battle data', async () => {
  renderCard();
  expect(screen.getByRole('status')).toHaveTextContent('Cargando carta...');
  expect(await screen.findByRole('heading', { name: 'Charizard base1-4' })).toBeInTheDocument();
  expect(axios).toHaveBeenCalledWith(`${api}/es/cards/base1-4`, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  expect(screen.getByRole('img', { name: 'Charizard' })).toHaveAttribute('src', `${card.image}/high.webp`);
  expect(screen.getByRole('link', { name: 'Abrir imagen ampliada' })).toHaveAttribute('target', '_blank');
  ['4 / 102', 'Rare', 'Mitsuhiro Arita', '120', 'Fire', 'Stage2', 'Charmeleon', '0', 'D', 'Card description',
    'Energy Burn', 'Ability effect', 'Fire Spin', 'Fire, Fire', '100+', 'Attack effect', 'Water x2', 'Fighting -30',
  ].forEach((text) => expect(screen.getByText(text)).toBeInTheDocument());
  const legality = screen.getByRole('region', { name: 'Legalidad por formato' });
  expect(within(legality).getByText('No')).toBeInTheDocument();
  expect(within(legality).getByText('Si')).toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Variantes de impresion' })).getByText('Holografica')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Volver al Pokemon' })).toHaveAttribute('href', '/pokedex/6');
  expect(screen.getByRole('link', { name: '#006' })).toHaveAttribute('href', '/pokedex/6');
});

test('opens card information from the gallery even when the card has no image', async () => {
  let resolveCard;
  axios.mockImplementation((url) => url.endsWith('/cards')
    ? Promise.resolve({ data: [{ id: card.id, name: card.name }] })
    : new Promise((resolve) => { resolveCard = resolve; }));
  renderCard('/pokemon');
  const link = await screen.findByRole('link', { name: 'Ver detalles de la carta: Charizard (base1-4)' });
  await userEvent.click(link);
  expect(screen.getByRole('status')).toHaveTextContent('Cargando carta...');
  await act(async () => { resolveCard({ data: card }); });
  expect(await screen.findByRole('heading', { name: 'Charizard base1-4' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('link', { name: 'Volver al Pokemon' }));
  expect(await screen.findByRole('heading', { name: 'Pokemon destination' })).toBeInTheDocument();
});

test('supports cards with missing optional fields and broken images', async () => {
  axios.mockResolvedValue({ data: { id: card.id, name: card.name, image: card.image } });
  renderCard();
  fireEvent.error(await screen.findByRole('img', { name: 'Charizard' }));
  expect(screen.getByText('Imagen no disponible.')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Abrir imagen ampliada' })).not.toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Ataques' })).not.toBeInTheDocument();
  expect(screen.getAllByText('No disponible').length).toBeGreaterThan(0);
  expect(screen.getByRole('link', { name: 'Volver a la Pokedex' })).toHaveAttribute('href', '/pokedex');
});

test.each([
  [Object.assign(new Error('Not found'), { response: { status: 404 } }), 'Carta no disponible en este idioma.'],
  [new Error('Network failure'), 'No se pudo cargar la carta.'],
])('reports missing cards and network failures with retry: %s', async (error, message) => {
  axios.mockRejectedValueOnce(error);
  renderCard();
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { name: 'Charizard base1-4' })).toBeInTheDocument();
  expect(axios).toHaveBeenCalledTimes(2);
});

test('rejects invalid card responses explicitly', async () => {
  axios.mockResolvedValue({ data: {} });
  renderCard();
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la carta.');
});

test('cancels stale requests on route changes and ignores their late responses', async () => {
  let resolveOld;
  axios.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }));
  const { unmount } = renderCard();
  const oldSignal = axios.mock.calls[0][1].signal;
  axios.mockResolvedValueOnce({ data: { id: 'next', name: 'Next Pokemon' } });
  fireEvent.click(screen.getByRole('link', { name: 'Next card' }));
  expect(await screen.findByRole('heading', { name: 'Next Pokemon next' })).toBeInTheDocument();
  expect(oldSignal.aborted).toBe(true);
  await act(async () => { resolveOld({ data: card }); });
  expect(screen.queryByRole('heading', { name: 'Charizard base1-4' })).not.toBeInTheDocument();
  const currentSignal = axios.mock.calls[1][1].signal;
  unmount();
  expect(currentSignal.aborted).toBe(true);
});

test('reloads in the selected language and clears the previous translation', async () => {
  localStorage.setItem('pokedex-language', 'es');
  renderCard('/cards/base1-4', true);
  await screen.findByRole('heading', { name: 'Charizard base1-4' });
  const oldSignal = axios.mock.calls[0][1].signal;
  axios.mockRejectedValueOnce(Object.assign(new Error('Not found'), { response: { status: 404 } }));
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(oldSignal.aborted).toBe(true);
  expect(screen.queryByRole('heading', { name: 'Charizard base1-4' })).not.toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent('Card not available in this language.');
  expect(axios).toHaveBeenLastCalledWith(`${api}/en/cards/base1-4`, expect.objectContaining({ signal: expect.any(AbortSignal) }));
});
