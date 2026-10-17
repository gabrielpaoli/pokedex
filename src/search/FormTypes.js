import TypeBadge from '../pokemon/TypeBadge';
import { useLanguage } from '../i18n/Language';

const FormTypes = ({ searchTypes, clickType }) => {
  const { t } = useLanguage();
  return (
    <div className="pokemon-type-filters" role="group" aria-label={t('type')}>
      {searchTypes.map((type, index) => (
        <TypeBadge key={type.name} type={type.name} selected={type.checked} onClick={() => clickType(type, index)} />
      ))}
    </div>
  );
};

export default FormTypes;
