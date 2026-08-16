import { useTranslation } from 'react-i18next';
import styles from './promotions.module.css';
import { Tag, Clock, Percent, ArrowRight, Gift, Sparkles } from 'lucide-react';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';

export default function Promotions() {
  const { t } = useTranslation();

  const promotions = [
    {
      id: 1,
      title: t('promotions.promo1Title') || 'Summer Sale - Up to 50% Off',
      description:
        t('promotions.promo1Desc') ||
        'Get amazing discounts on selected electronics and gadgets. Limited time offer!',
      discount: '50%',
      category: t('promotions.category1') || 'Summer Sale',
      validUntil: '2024-08-31',
      image: '/uploads/unsplash/1531297484001-80022131f5a1.jpg',
      featured: true
    },
    {
      id: 2,
      title: t('promotions.promo2Title') || 'Gaming Bundle Special',
      description:
        t('promotions.promo2Desc') ||
        'Buy a gaming laptop and get a free gaming mouse and keyboard.',
      discount: '30%',
      category: t('promotions.category2') || 'Gaming',
      validUntil: '2024-09-15',
      image: '/uploads/unsplash/1593640408182-31c70c8268f5.jpg',
      featured: false
    },
    {
      id: 3,
      title: t('promotions.promo3Title') || 'Smart Home Starter Kit',
      description:
        t('promotions.promo3Desc') ||
        'Complete smart home package at an unbeatable price. Includes smart bulbs, thermostat, and security camera.',
      discount: '25%',
      category: t('promotions.category3') || 'Smart Home',
      validUntil: '2024-09-30',
      image: '/uploads/unsplash/1573164713988-8665fc963095.jpg',
      featured: false
    },
    {
      id: 4,
      title: t('promotions.promo4Title') || 'Audio Equipment Clearance',
      description:
        t('promotions.promo4Desc') ||
        'Premium headphones and speakers at clearance prices. While supplies last.',
      discount: '40%',
      category: t('promotions.category4') || 'Audio',
      validUntil: '2024-08-25',
      image: '/uploads/unsplash/1505740420928-5e560c06d30e.jpg',
      featured: false
    },
    {
      id: 5,
      title: t('promotions.promo5Title') || 'Mobile Phone Trade-In Bonus',
      description:
        t('promotions.promo5Desc') ||
        'Trade in your old phone and get an extra $100 credit towards a new device.',
      discount: '$100',
      category: t('promotions.category5') || 'Mobile',
      validUntil: '2024-10-01',
      image: '/uploads/unsplash/1511707171634-5f897ff02aa9.jpg',
      featured: false
    },
    {
      id: 6,
      title: t('promotions.promo6Title') || 'TV & Home Theater Event',
      description:
        t('promotions.promo6Desc') ||
        'Save big on 4K TVs and home theater systems. Free installation included.',
      discount: '35%',
      category: t('promotions.category6') || 'TV & Audio',
      validUntil: '2024-09-20',
      image: '/uploads/unsplash/1593359677879-a4bb92f829d1.jpg',
      featured: false
    },
    {
      id: 7,
      title: t('promotions.promo7Title') || 'Laptop Back to School',
      description:
        t('promotions.promo7Desc') ||
        'Special pricing for students on laptops and tablets. Valid student ID required.',
      discount: '20%',
      category: t('promotions.category7') || 'Computers',
      validUntil: '2024-09-10',
      image: '/uploads/unsplash/1496181133206-80ce9b88a853.jpg',
      featured: false
    },
    {
      id: 8,
      title: t('promotions.promo8Title') || 'Free Shipping Weekend',
      description:
        t('promotions.promo8Desc') ||
        'Enjoy free shipping on all orders over $50 this weekend only.',
      discount: 'Free',
      category: t('promotions.category8') || 'Shipping',
      validUntil: '2024-08-18',
      image: '/uploads/unsplash/1488590528505-98d2b5aba04b.jpg',
      featured: false
    }
  ];

  const featuredPromo = promotions.find(p => p.featured);
  const regularPromos = promotions.filter(p => !p.featured);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Sparkles size={32} />
        </div>
        <h1 className={styles.title}>{t('promotions.title') || 'Promotions'}</h1>
        <p className={styles.subtitle}>
          {t('promotions.subtitle') || 'Exclusive deals and special offers just for you'}
        </p>
      </div>

      <div className={styles.content}>
        {featuredPromo && (
          <div className={styles.featuredPromo}>
            <div className={styles.featuredImage}>
              <OptimizedImage
                src={featuredPromo.image}
                alt={featuredPromo.title}
                variant="hero"
                eager
              />
              <div className={styles.featuredBadge}>
                <Gift size={20} />
                {t('promotions.featured') || 'Featured'}
              </div>
              <div className={styles.discountBadge}>
                <Percent size={24} />
                {featuredPromo.discount}
              </div>
            </div>
            <div className={styles.featuredContent}>
              <div className={styles.category}>{featuredPromo.category}</div>
              <h2 className={styles.featuredTitle}>{featuredPromo.title}</h2>
              <p className={styles.featuredDescription}>{featuredPromo.description}</p>
              <div className={styles.validity}>
                <Clock size={16} />
                {t('promotions.validUntil') || 'Valid until'}: {featuredPromo.validUntil}
              </div>
              <button className={styles.shopButton}>
                {t('promotions.shopNow') || 'Shop Now'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        <div className={styles.promotionsGrid}>
          {regularPromos.map(promo => (
            <div key={promo.id} className={styles.promoCard}>
              <div className={styles.promoImage}>
                <OptimizedImage
                  src={promo.image}
                  alt={promo.title}
                  variant="thumb"
                />
                <div className={styles.discountBadge}>
                  <Percent size={20} />
                  {promo.discount}
                </div>
              </div>
              <div className={styles.promoContent}>
                <div className={styles.category}>{promo.category}</div>
                <h3 className={styles.promoTitle}>{promo.title}</h3>
                <p className={styles.promoDescription}>{promo.description}</p>
                <div className={styles.validity}>
                  <Clock size={14} />
                  {t('promotions.validUntil') || 'Valid until'}: {promo.validUntil}
                </div>
                <button className={styles.viewButton}>
                  {t('promotions.viewDetails') || 'View Details'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
