import styles from './wishlist.module.css';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import emptyWishlistImage from '../assets/pictures/wishlistToolTipPhoto.webp';
import ProductCard from './subCategoryPage/components/productCard/productCard';

export default function Wishlist() {
  const { t } = useTranslation();
  const { wishlistItems } = useWishlist();
  const { addToCart } = useCart();
  const [isMovingAll, setIsMovingAll] = useState(false);

  const handleMoveAllToCart = () => {
    setIsMovingAll(true);
    wishlistItems.forEach(product => {
      addToCart(product);
    });
    setTimeout(() => {
      setIsMovingAll(false);
    }, 500);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{t('wishlist.title')}</h1>
          </div>
        </div>
        <div className={styles.emptyCard}>
          <img className={styles.emptyImage} src={emptyWishlistImage} alt="" />
          <h2 className={styles.emptyTitle}>{t('wishlist.empty')}</h2>
          <p className={styles.emptyHint}>{t('wishlist.emptyHint')}</p>
          <Link to="/" className={styles.continueShopping}>
            {t('cart.continueShopping')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{t('wishlist.title')}</h1>
          <p className={styles.count}>
            {t('wishlist.itemsCount', { count: wishlistItems.length })}
          </p>
        </div>
        <button
          type="button"
          className={styles.moveAllToCartBtn}
          onClick={handleMoveAllToCart}
          disabled={isMovingAll}>
          <ShoppingCart size={16} />
          {isMovingAll ? t('wishlist.moving') : t('wishlist.moveAllToCart')}
        </button>
      </div>

      <div className={styles.wishlistGrid}>
        {wishlistItems.map(product => (
          <ProductCard key={product.id} product={product} t={t} />
        ))}
      </div>
    </div>
  );
}
