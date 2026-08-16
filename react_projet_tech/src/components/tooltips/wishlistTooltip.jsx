import styles from './wishlistTooltip.module.css';
import emptyCartImage from '../../assets/pictures/wishlistToolTipPhoto.webp';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../context/WishlistContext';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import OptimizedImage from '../OptimizedImage/OptimizedImage';

export const WishlistTooltip = () => {
  const { t } = useTranslation();
  const { wishlistItems, removeFromWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <>
        <div className={styles.hiddenDiv}></div>
        <div className={styles.tooltip}>
          <p className={styles.title}>{t('tooltip.wishlist.title')}</p>
          <p className={styles.description}>{t('tooltip.wishlist.subtitle')}</p>
          <img className={styles.emptyCartImage} src={emptyCartImage} alt="Empty cart" />
          <button className={styles.continueShoppingButton}>{t('tooltip.wishlist.button')}</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.hiddenDiv}></div>
      <div className={styles.tooltip}>
        <p className={wishlistItems.length > 0 ? styles.title : styles.titleDefault}>
          {wishlistItems.length > 0
            ? t('tooltip.wishlist.YourList')
            : t('tooltip.wishlist.title')}{' '}
        </p>
        <div className={styles.wishlistItems}>
          {wishlistItems.map(item => {
            const currentPrice =
              Number(item.discountPrice) && Number(item.discountPrice) < Number(item.price)
                ? Number(item.discountPrice)
                : Number(item.price);
            return (
              <div key={item.id} className={styles.wishlistItem}>
                <OptimizedImage
                  className={styles.itemImage}
                  product={item}
                  alt={item.name}
                  variant="thumb"
                />
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <p className={styles.itemPrice}>{currentPrice} ₾</p>
                </div>
                <button className={styles.removeButton} onClick={() => removeFromWishlist(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
        <div className={styles.wishlistSummary}>
          <Link to="/wishlist" className={styles.viewWishlistButton}>
            {t('tooltip.wishlist.viewWishlist') || 'View Wishlist'}
          </Link>
        </div>
      </div>
    </>
  );
};
