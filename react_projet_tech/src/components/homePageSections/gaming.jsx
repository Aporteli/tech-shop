import { Link } from 'react-router-dom';
import styles from './gaming.module.css';
import { useTranslation } from 'react-i18next';
import gaming1 from '../../assets/pictures/homePagePhotos/mixPhotos/Gaming1.webp';
import gaming2 from '../../assets/pictures/homePagePhotos/mixPhotos/Gaming2.webp';
import gaming3 from '../../assets/pictures/homePagePhotos/mixPhotos/Gaming3.webp';
import gaming4 from '../../assets/pictures/homePagePhotos/mixPhotos/Gaming4.webp';
import gaming5 from '../../assets/pictures/homePagePhotos/mixPhotos/Gaming5.webp';

const GAMING_IMAGES = [gaming1, gaming2, gaming3, gaming4, gaming5];

export default function Gaming({ title, data }) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{t('gamingCategory.description')}</p>
      <div className={styles.mainDiv}>
        {data.map((item, index) => (
          <Link
            to={item.link}
            className={`${styles.item} ${styles[`item${index + 1}`]}`}
            key={item.id || index}
            aria-label={item.title || item.name}>
            <img
              className={styles.image}
              src={GAMING_IMAGES[index] || GAMING_IMAGES[0]}
              alt={item.title || item.name}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
