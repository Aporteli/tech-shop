import styles from './homeCategoriesSection.module.css';
import phoneIcon from '../../assets/categoriesIcons/phoneIcon.webp';
import tvIcon from '../../assets/categoriesIcons/tvIcon.webp';
import cameraIcon from '../../assets/categoriesIcons/cameraIcon.webp';
import computerIcon from '../../assets/categoriesIcons/computerIcon.webp';
import gamingIcon from '../../assets/categoriesIcons/gamingIcon.webp';
import homeAppliancesIcon from '../../assets/categoriesIcons/homeAppliancesIcon.webp';
import houseAndGardenIcon from '../../assets/categoriesIcons/houseAndGardenIcon.webp';
import ovenIcon from '../../assets/categoriesIcons/ovenIcon.webp';
import personalCareIcon from '../../assets/categoriesIcons/personalCareIcon.webp';
import smatrtHomeIcon from '../../assets/categoriesIcons/smartHomeIcon.webp';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchMainCategorySlugs } from '../../api/categoryService';

const categories = [
  { icon: phoneIcon, slug: 'mobile-phones-and-accessories' },
  { icon: tvIcon, slug: 'tv-and-audio' },
  { icon: cameraIcon, slug: 'photo-and-video' },
  { icon: computerIcon, slug: 'computers-and-accessories' },
  { icon: gamingIcon, slug: 'gaming' },
  { icon: homeAppliancesIcon, slug: 'home-appliances' },
  { icon: houseAndGardenIcon, slug: 'house-and-garden' },
  { icon: ovenIcon, slug: 'small-domestic-appliances' },
  { icon: personalCareIcon, slug: 'personal-care' },
  { icon: smatrtHomeIcon, slug: 'smart-home' }
];

export default function HomeCategoriesSection() {
  const { t } = useTranslation();
  const [categorySlugs, setCategorySlugs] = useState([]);

  useEffect(() => {
    fetchMainCategorySlugs()
      .then(data => setCategorySlugs(data))
      .catch(err => console.error('Error fetching category slugs:', err));
  }, []);

  const categoriesList = t('categoriesONhomePage.categoriesONhome', { returnObjects: true }) || {};
  const categoriesListArray = Object.values(categoriesList);
  const translatedCategories = categories.map((item, index) => ({
    ...item,
    name: categoriesListArray[index] || item.name // თუ თარგმანი არ არის, დატოვებს საწყის სახელს
  }));

  return (
    <div className={styles.categoriesSection}>
      <h1 className={styles.categoriesTitle}>{t('categoriesONhomePage.categories.title')}</h1>
      <div className={styles.categories}>
        {translatedCategories.map((category, index) => (
          <Link to={`/category/${category.slug}`} className={styles.categoryItem} key={index}>
            <p className={styles.categoryText}>{category.name}</p>
            <div className={styles.categoryIconContainer}>
              <img src={category.icon} alt={category.name} className={styles.categoryIcon} />
            </div>
            <div className={styles.categoryOverlay}></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
