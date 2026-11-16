import { act, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Cards from './Cards';
import Card from './Card';
import Header from '../general/header/Header';
import { LanguageProvider } from '../i18n/Language';

jest.mock('axios', () => jest.fn());

const card = { id: 'base1-58', name: 'Pikachu' };
const results = Array.from({ length: 13 }, (_, i) => ({ ...card, id: `set-${i}` }));

function renderSearch(path = '/cards') {
  return render(
    <LanguageProvider><MemoryRouter initialEntries={[path]}>
      <Header />
      <Link to="/cards?q=Eevee">Other search</Link>
      <Routes>
        <Route path="/cards" element={<Cards />} />
        <Route path="/cards/:id" element={<Card />} />
      </Routes>
    </MemoryRouter></LanguageProvider>
  );
}

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.setItem('pokedex-language', 'es');
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('exposes card search in navigation and avoids requests for empty submissions', () => {
  renderSearch();
  expect(screen.getByRole('link', { name: 'Cartas' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByText('Escribe el nombre de una carta para comenzar la busqueda.')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '   ' } });
  fireEvent.submit(screen.getByRole('search'));
  expect(axios).not.toHaveBeenCalled();
});

test('submits trimmed names, shows loading and paginates results without extra requests', async () => {
  let resolve;
  axios.mockImplementation(() => new Promise((done) => { resolve = done; }));
  renderSearch();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Nombre de la carta' }), { target: { value: ' Pikachu ' } });
  fireEvent.submit(screen.getByRole('search'));
  expect(screen.getByRole('status')).toHaveTextContent('Cargando cartas...');
  expect(axios).toHaveBeenCalledWith('https://api.tcgdex.net/v2/es/cards', expect.objectContaining({
    params: { name: 'Pikachu' }, signal: expect.any(AbortSignal),
  }));
  await act(async () => { resolve({ data: results }); });
  expect(screen.getAllByRole('listitem')).toHaveLength(12);
  fireEvent.click(screen.getByRole('button', { name: 'Mostrar mas' }));
  expect(screen.getAllByRole('listitem')).toHaveLength(13);
  expect(screen.queryByRole('button', { name: 'Mostrar mas' })).not.toBeInTheDocument();
  expect(axios).toHaveBeenCalledTimes(1);
});

test('opens image-less results and returns to the same URL query', async () => {
  let resolveDetails;
  axios.mockImplementation((url) => url.endsWith('/cards')
    ? Promise.resolve({ data: [card] })
    : new Promise((resolve) => { resolveDetails = resolve; }));
  renderSearch('/cards?q=Pikachu');
  const link = await screen.findByRole('link', { name: 'Ver detalles de la carta: Pikachu (base1-58)' });
  expect(screen.getByText('Imagen no disponible.')).toBeInTheDocument();
  fireEvent.click(link);
  await act(async () => { resolveDetails({ data: { ...card, dexId: [25] } }); });
  expect(screen.getByRole('heading', { name: 'Pikachu base1-58' })).toBeInTheDocument();
  const back = screen.getByRole('link', { name: 'Volver al buscador de cartas' });
  expect(back).toHaveAttribute('href', '/cards?q=Pikachu');
  fireEvent.click(back);
  expect(await screen.findByRole('link', { name: /Ver detalles de la carta/ })).toBeInTheDocument();
  expect(screen.getByRole('searchbox')).toHaveValue('Pikachu');
});

test.each([new Error('Network error'), {}])('reports search errors and retries: %s', async (failure) => {
  if (failure instanceof Error) axios.mockRejectedValueOnce(failure);
  else axios.mockResolvedValueOnce({ data: failure });
  axios.mockResolvedValue({ data: [] });
  renderSearch('/cards?q=Pikachu');
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las cartas.');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByText('No hay cartas que coincidan con la busqueda en este idioma.')).toBeInTheDocument();
});

test('cancels stale searches, resets batches and ignores late responses', async () => {
  axios.mockResolvedValueOnce({ data: results });
  const { unmount } = renderSearch('/cards?q=Pikachu');
  fireEvent.click(await screen.findByRole('button', { name: 'Mostrar mas' }));
  let resolveOld;
  axios.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }));
  fireEvent.click(screen.getByRole('link', { name: 'Other search' }));
  const oldSignal = axios.mock.calls[1][1].signal;
  expect(screen.getByRole('searchbox')).toHaveValue('Eevee');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  axios.mockResolvedValueOnce({ data: results });
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Pikachu' } });
  fireEvent.submit(screen.getByRole('search'));
  await screen.findByRole('button', { name: 'Mostrar mas' });
  expect(screen.getAllByRole('listitem')).toHaveLength(12);
  expect(oldSignal.aborted).toBe(true);
  await act(async () => { resolveOld({ data: [{ id: 'eevee', name: 'Eevee' }] }); });
  expect(screen.queryByRole('heading', { name: 'Eevee' })).not.toBeInTheDocument();
  const signal = axios.mock.calls[2][1].signal;
  unmount();
  expect(signal.aborted).toBe(true);
});

test('repeats the saved query when switching language', async () => {
  axios.mockResolvedValueOnce({ data: [card] });
  renderSearch('/cards?q=Pikachu');
  await screen.findByRole('link', { name: /Ver detalles de la carta/ });
  const oldSignal = axios.mock.calls[0][1].signal;
  axios.mockResolvedValueOnce({ data: [] });
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(await screen.findByText('No cards match this search in this language.')).toBeInTheDocument();
  expect(oldSignal.aborted).toBe(true);
  expect(axios).toHaveBeenLastCalledWith('https://api.tcgdex.net/v2/en/cards', expect.objectContaining({
    params: { name: 'Pikachu' },
  }));
});
