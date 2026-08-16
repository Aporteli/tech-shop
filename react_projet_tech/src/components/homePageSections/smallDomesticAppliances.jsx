import { Link } from 'react-router-dom';
import styles from './smallDomesticAppliances.module.css';
import { useTranslation } from 'react-i18next';
import house1 from '../../assets/pictures/homePagePhotos/mixPhotos/House And Garden1.webp';
import house2 from '../../assets/pictures/homePagePhotos/mixPhotos/House And Garden2.webp';
import house3 from '../../assets/pictures/homePagePhotos/mixPhotos/House And Garden3.webp';
import house4 from '../../assets/pictures/homePagePhotos/mixPhotos/House And Garden4.webp';
import house5 from '../../assets/pictures/homePagePhotos/mixPhotos/House And Garden5.webp';

const HOUSE_IMAGES = [house1, house2, house3, house4, house5];

export default function SmallDomesticAppliances({ title, data }) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{t('smallDomesticAppliances.description')}</p>
      <div className={styles.mainDiv}>
        {data.map((item, index) => (
          <Link
            to={item.link}
            className={styles.item}
            key={item.id || index}
            aria-label={item.title || item.name}>
            <img
              className={styles.image}
              src={HOUSE_IMAGES[index] || HOUSE_IMAGES[0]}
              alt={item.title || item.name}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
