import styles from './compareTooltip.module.css';
import emptyCartImage from '../../assets/pictures/compareToolTipPhoto.webp';
import { useTranslation } from 'react-i18next';
import { useCompare } from '../../context/CompareContext';
import { Link } from 'react-router-dom';

export const CompareTooltip = () => {
  const { t } = useTranslation();
  const { compareCount } = useCompare();

  return (
    <>
      <div className={styles.hiddenDiv}></div>
      <div className={styles.tooltip}>
        <p className={compareCount > 0 ? styles.title : styles.titleDefault}>
          {compareCount > 0 ? t('tooltip.compare.yourList') || 'Another Title' : t('tooltip.compare.title')}
        </p>
        <p className={styles.description}>
          {compareCount > 0
            ? `${t('tooltip.compare.items') || 'Items'}: ${compareCount}`
            : t('tooltip.compare.subtitle')}
        </p>
        {compareCount === 0 && <img className={styles.emptyCartImage} src={emptyCartImage} alt="Empty cart" />}
        <Link to="/compare" className={styles.continueShoppingButton}>
          {compareCount > 0 ? t('tooltip.compare.viewCompare') || 'View Compare' : t('tooltip.compare.button')}
        </Link>
      </div>
    </>
  );
};
