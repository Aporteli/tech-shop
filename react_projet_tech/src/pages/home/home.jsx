import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './home.module.css';
import { useTranslation } from 'react-i18next';
import ImageSlider from '../../components/homePageSections/imageSlider';
import GiftSlider from '../../components/homePageSections/giftSlider';
import LogoSlider from '../../components/homePageSections/logoSlider';
import DiscountSlider from '../../components/homePageSections/discountSlider';
import SmallDomesticAppliances from '../../components/homePageSections/smallDomesticAppliances';
import Gaming from '../../components/homePageSections/gaming';
import HomeCategoriesSection from '../../components/homePageSections/homeCategoriesSection';
import mainSliderImg_1 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-1.webp';
import mainSliderImg_2 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-2.webp';
import mainSliderImg_3 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-3.webp';
import mainSliderImg_4 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-4.webp';
import mainSliderImg_5 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-5.webp';
import mainSliderImg_6 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-6.webp';
import mainSliderImg_7 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-7.webp';
import mainSliderImg_8 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-8.webp';
import mainSliderImg_9 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-9.webp';
import mainSliderImg_10 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-10.webp';
import mainSliderImg_11 from '../../assets/pictures/homePagePhotos/mainSliderPhotos/mainSliderImg-11.webp';

import homePagePhoto_1 from '../../assets/pictures/homePagePhotos/mixPhotos/homePagePhoto-1.webp';
import homePagePhoto_2 from '../../assets/pictures/homePagePhotos/mixPhotos/homePagePhoto-2.webp';

const BASE_URL = 'http://localhost:5001';

const myImages = [
  { url: mainSliderImg_1, alt: 'first' },
  { url: mainSliderImg_2, alt: 'second' },
  { url: mainSliderImg_3, alt: 'third' },
  { url: mainSliderImg_4, alt: 'fourth' },
  { url: mainSliderImg_5, alt: 'fifth' },
  { url: mainSliderImg_6, alt: 'sixth' },
  { url: mainSliderImg_7, alt: 'seventh' },
  { url: mainSliderImg_8, alt: 'eighth' },
  { url: mainSliderImg_9, alt: 'ninth' },
  { url: mainSliderImg_10, alt: 'tenth' },
  { url: mainSliderImg_11, alt: 'eleventh' }
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [discountProducts, setDiscountProducts] = useState([]);
  const [giftProducts, setGiftProducts] = useState([]);

  const smallDomesticAppliancesTitle = t('smallDomesticAppliances.title');
  const smallDomesticAppliancesData = t('smallDomesticAppliances.data', {
    returnObjects: true
  });
  const gamingTitle = t('gamingCategory.title');
  const gamingData = t('gamingCategory.data', {
    returnObjects: true
  });

  useEffect(() => {
    const lang = i18n.language?.split('-')[0] || 'en';

    fetch(`${BASE_URL}/api/products?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        const products = (Array.isArray(data) ? data : data.products || []).filter(
          product => product?.is_active !== false && product?.image
        );

        const discounted = products.filter(product => {
          const price = Number(product.price);
          const discountPrice = Number(product.discount_price);
          return discountPrice > 0 && discountPrice < price;
        });

        setDiscountProducts((discounted.length ? discounted : products).slice(0, 12));
        setGiftProducts(products.slice(0, 12));
      })
      .catch(err => {
        console.error('Failed to load home slider products:', err);
      });
  }, [i18n.language]);

  return (
    <div className={styles.homeWrapper}>
      <div className={styles.mainSection}>
        <ImageSlider images={myImages} />
        <div className={styles.imagesContainer}>
          <div className={styles.imageItem}>
            <img className={styles.image} src={homePagePhoto_1} alt="Image" />
          </div>
          <div className={styles.imageItem}>
            <img className={styles.image} src={homePagePhoto_2} alt="Image" />
          </div>
        </div>

        <HomeCategoriesSection />

        <LogoSlider />
        {discountProducts.length > 0 && <DiscountSlider images={discountProducts} />}

        <Link to="/promotions" className={styles.promoBanner}>
          <div className={styles.promoContent}>
            <span className={styles.promoBadge}>{t('homeBanner.badge')}</span>
            <h2 className={styles.promoTitle}>{t('homeBanner.title')}</h2>
            <p className={styles.promoText}>{t('homeBanner.subtitle')}</p>
            <span className={styles.promoCta}>
              {t('promotions.shopNow')}
              <ArrowRight size={18} />
            </span>
          </div>
        </Link>

        {giftProducts.length > 0 && <GiftSlider images={giftProducts} />}

        <SmallDomesticAppliances
          title={smallDomesticAppliancesTitle}
          data={smallDomesticAppliancesData}
        />
        <Gaming title={gamingTitle} data={gamingData} />

        {discountProducts.length > 0 && <DiscountSlider images={discountProducts} />}
      </div>
    </div>
  );
}
