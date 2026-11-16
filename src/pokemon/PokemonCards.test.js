import { act, fireEvent, render, screen, within } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '../i18n/Language';
import PokemonCards from './PokemonCards';

jest.mock('axios', () => jest.fn());

const card = {
  id: 'base1-44', name: 'Bulbasaur', image: 'https://assets.tcgdex.net/en/base/base1/44',
};

function renderGallery(ui) {
  return render(ui, { wrapper: MemoryRouter });
}

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

test('shows loading, queries by exact species number and renders expandable batches of 12', async () => {
  let resolveCards;
  axios.mockImplementation(() => new Promise((resolve) => { resolveCards = resolve; }));
  renderGallery(<PokemonCards speciesId="1" />);
  expect(screen.getByRole('status')).toHaveTextContent('Cargando cartas...');
  expect(axios).toHaveBeenCalledWith('https://api.tcgdex.net/v2/es/cards', expect.objectContaining({
    params: { dexId: 'eq:1' }, signal: expect.any(AbortSignal),
  }));
  await act(async () => {
    resolveCards({ data: Array.from({ length: 25 }, (_, index) => ({ ...card, id: `set-${index}` })) });
  });
  expect(screen.getAllByRole('listitem')).toHaveLength(12);
  expect(screen.getByText('Cartas mostradas: 12 / 25')).toBeInTheDocument();
  const firstLink = screen.getAllByRole('link', { name: /Ver detalles de la carta/ })[0];
  expect(firstLink).toHaveAttribute('href', '/cards/set-0');
  expect(firstLink).not.toHaveAttribute('target');
  expect(within(firstLink).getByRole('img', { name: 'Bulbasaur' })).toHaveAttribute('src', `${card.image}/low.webp`);
  expect(within(firstLink).getByRole('img', { name: 'Bulbasaur' })).toHaveAttribute('loading', 'lazy');
  fireEvent.click(screen.getByRole('button', { name: 'Mostrar mas' }));
  expect(screen.getAllByRole('listitem')).toHaveLength(24);
  fireEvent.click(screen.getByRole('button', { name: 'Mostrar mas' }));
  expect(screen.getAllByRole('listitem')).toHaveLength(25);
  expect(screen.queryByRole('button', { name: 'Mostrar mas' })).not.toBeInTheDocument();
  expect(axios).toHaveBeenCalledTimes(1);
});

test('reports an empty localized catalogue', async () => {
  axios.mockResolvedValue({ data: [] });
  renderGallery(<PokemonCards speciesId="1025" />);
  expect(await screen.findByText('No hay cartas disponibles para esta especie en este idioma.')).toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

test.each([new Error('Network failure'), { invalid: true }])('reports failed or invalid responses and retries independently: %s', async (failure) => {
  if (failure instanceof Error) axios.mockRejectedValueOnce(failure);
  else axios.mockResolvedValueOnce({ data: failure });
  axios.mockResolvedValue({ data: [card] });
  renderGallery(<PokemonCards speciesId="1" />);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las cartas.');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('img', { name: 'Bulbasaur' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(axios).toHaveBeenCalledTimes(2);
});

test('labels absent and broken images without hiding the card identity', async () => {
  axios.mockResolvedValue({ data: [card, { id: 'base2-67', name: 'Bulbasaur' }] });
  renderGallery(<PokemonCards speciesId="1" />);
  const image = await screen.findByRole('img', { name: 'Bulbasaur' });
  expect(screen.getAllByText('Imagen no disponible.')).toHaveLength(1);
  fireEvent.error(image);
  expect(screen.getAllByText('Imagen no disponible.')).toHaveLength(2);
  expect(screen.getByRole('link', { name: 'Ver detalles de la carta: Bulbasaur (base1-44)' })).toHaveAttribute('href', '/cards/base1-44');
  expect(screen.getByRole('link', { name: 'Ver detalles de la carta: Bulbasaur (base2-67)' })).toHaveAttribute('href', '/cards/base2-67');
  expect(screen.getByText('base1-44')).toBeInTheDocument();
  expect(screen.getByText('base2-67')).toBeInTheDocument();
});

test('cancels stale species requests, clears old cards and resets the visible batch', async () => {
  let resolveOld;
  axios.mockResolvedValueOnce({
    data: Array.from({ length: 13 }, (_, index) => ({ ...card, id: `set-${index}` })),
  });
  const { rerender, unmount } = renderGallery(<PokemonCards speciesId="1" />);
  await screen.findByRole('button', { name: 'Mostrar mas' });
  fireEvent.click(screen.getByRole('button', { name: 'Mostrar mas' }));
  const firstSignal = axios.mock.calls[0][1].signal;
  axios.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }));
  rerender(<PokemonCards speciesId="2" />);
  expect(firstSignal.aborted).toBe(true);
  expect(screen.queryByText('set-0')).not.toBeInTheDocument();
  const oldSignal = axios.mock.calls[1][1].signal;
  axios.mockResolvedValueOnce({
    data: Array.from({ length: 13 }, (_, index) => ({ ...card, name: 'Venusaur', id: `new-${index}` })),
  });
  rerender(<PokemonCards speciesId="3" />);
  await screen.findAllByText('Venusaur');
  expect(oldSignal.aborted).toBe(true);
  await act(async () => { resolveOld({ data: [{ ...card, name: 'Ivysaur' }] }); });
  expect(screen.queryByText('Ivysaur')).not.toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(12);
  const currentSignal = axios.mock.calls[2][1].signal;
  unmount();
  expect(currentSignal.aborted).toBe(true);
});

function LocalizedGallery() {
  const { setLanguage } = useLanguage();
  return <><button onClick={() => setLanguage('en')}>English</button><PokemonCards speciesId="1" /></>;
}

test('reloads cards in the selected language without retaining the previous catalogue', async () => {
  localStorage.setItem('pokedex-language', 'es');
  let resolveEnglish;
  axios.mockResolvedValueOnce({ data: [{ ...card, name: 'Carta en espanol' }] });
  renderGallery(<LanguageProvider><LocalizedGallery /></LanguageProvider>);
  await screen.findByText('Carta en espanol');
  const spanishSignal = axios.mock.calls[0][1].signal;
  axios.mockImplementationOnce(() => new Promise((resolve) => { resolveEnglish = resolve; }));
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(spanishSignal.aborted).toBe(true);
  expect(screen.queryByText('Carta en espanol')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Loading cards...');
  expect(axios).toHaveBeenLastCalledWith('https://api.tcgdex.net/v2/en/cards', expect.objectContaining({
    params: { dexId: 'eq:1' },
  }));
  await act(async () => { resolveEnglish({ data: [] }); });
  expect(await screen.findByText('No cards available for this species in this language.')).toBeInTheDocument();
});
