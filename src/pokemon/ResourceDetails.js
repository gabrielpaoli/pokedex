import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatName, localized, useLanguage } from '../i18n/Language';
import FlashOn from '@mui/icons-material/FlashOn';
import TrackChanges from '@mui/icons-material/TrackChanges';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import TypeBadge from './TypeBadge';

const categoryIcons = { physical: FlashOn, special: TrackChanges, status: AutoAwesome };

export function ResourceDetails({ resource, hidden = false, move = false }) {
  const { language, t } = useLanguage();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!resource.url) return;
    const controller = new AbortController();
    setData(null);
    setError(false);
    axios(resource.url, { signal: controller.signal }).then((response) => {
      if (!controller.signal.aborted) setData(response.data);
    }).catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [resource.url, attempt]);

  const name = localized(data?.names, language)?.name || formatName(resource.name);
  const effect = localized(data?.effect_entries, language);
  const flavor = localized([...(data?.flavor_text_entries || [])].reverse(), language);
  const description = effect?.effect || flavor?.flavor_text;
  const CategoryIcon = categoryIcons[data?.damage_class?.name] || AutoAwesome;

  return (
    <li className={`pokemon-resource${move ? ' pokemon-move-card' : ''}`}>
      {move && data && <div className="pokemon-move-badges">
        <TypeBadge type={data.type.name} />
        <span className="pokemon-category"><CategoryIcon aria-hidden="true" fontSize="small" />{t(data.damage_class.name)}</span>
      </div>}
      <h3>{name}{hidden && <span className="pokemon-hidden">{t('hidden')}</span>}</h3>
      {error ? <div><p role="alert">{t('detailsError')}</p><button onClick={() => setAttempt((value) => value + 1)}>{t('retry')}</button></div>
        : !data && resource.url ? <p role="status">{t('loadingDetails')}</p>
          : <p>{description
            ? description.replace(/\$effect_chance/g, String(data.effect_chance ?? '')).replace(/[\n\f\r]+/g, ' ')
            : t('descriptionUnavailable')}</p>}
      {move && data && (
        <dl className="pokemon-move-values">
          <div><dt>{t('power')}</dt><dd>{data.power ?? '-'}</dd></div>
          <div><dt>{t('accuracy')}</dt><dd>{data.accuracy == null ? '-' : `${data.accuracy}%`}</dd></div>
          <div><dt>PP</dt><dd>{data.pp ?? '-'}</dd></div>
        </dl>
      )}
    </li>
  );
}

export function Moves({ moves }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(12);

  return (
    <details className="pokemon-panel pokemon-disclosure" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary><span>{t('moves')}</span><span className="pokemon-count">{moves.length}</span></summary>
      {open && <>
        <p className="pokemon-section-note">{t('movesNote')}</p>
        <ul className="pokemon-moves">
          {moves.slice(0, limit).map(({ move }) => <ResourceDetails key={move.name} resource={move} move />)}
        </ul>
        {limit < moves.length && <button onClick={() => setLimit((value) => value + 12)}>{t('showMore')}</button>}
        {moves.length === 0 && <p>{t('noMoves')}</p>}
      </>}
    </details>
  );
}
