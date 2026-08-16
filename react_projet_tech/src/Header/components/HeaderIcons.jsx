import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CartIcon from '../../icons/cartIcon.jsx';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import HeartIcon from '../../icons/heartIcon.jsx';
import CompareIcon from '../../icons/compareIcon.jsx';
import { CartIconTooltip } from '../../components/tooltips/cartIconTooltip.jsx';
import { WishlistTooltip } from '../../components/tooltips/wishlistTooltip.jsx';
import { CompareTooltip } from '../../components/tooltips/compareTooltip.jsx';
import { useTranslation } from 'react-i18next';
import styles from '../Header.module.css';

export default function HeaderIcons() {
  const { t } = useTranslation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const [cartAnimation, setCartAnimation] = useState(false);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);
  const [compareAnimation, setCompareAnimation] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [wishlistHover, setWishlistHover] = useState(false);
  const [compareHover, setCompareHover] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setCartAnimation(true);
      setTimeout(() => {
        setCartAnimation(false);
      }, 500);
    }
  }, [cartCount]);

  useEffect(() => {
    if (wishlistCount > 0) {
      setWishlistAnimation(true);
      setTimeout(() => {
        setWishlistAnimation(false);
      }, 500);
    }
  }, [wishlistCount]);

  useEffect(() => {
    if (compareCount > 0) {
      setCompareAnimation(true);
      setTimeout(() => {
        setCompareAnimation(false);
      }, 500);
    }
  }, [compareCount]);

  return (
    <div className={styles.headerCart}>
      <div
        className={styles.cartIconWrapper}
        onMouseEnter={() => setCartHover(true)}
        onMouseLeave={() => setCartHover(false)}>
        <Link
          to="/cart"
          className={`${styles.iconLink} ${cartAnimation ? styles.cartJump : ''}`}
          aria-label={t('header.cart')}>
          <CartIcon />
          {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
        </Link>
        {cartHover && <CartIconTooltip />}
      </div>
      <div
        className={styles.cartIconWrapper}
        onMouseEnter={() => setWishlistHover(true)}
        onMouseLeave={() => setWishlistHover(false)}>
        <Link
          to="/wishlist"
          className={`${styles.iconLink} ${wishlistAnimation ? styles.cartJump : ''}`}
          aria-label={t('wishlist.title')}>
          <HeartIcon />
          {wishlistCount > 0 && <span className={styles.cartCount}>{wishlistCount}</span>}
        </Link>
        {wishlistHover && <WishlistTooltip />}
      </div>
      <div
        className={styles.cartIconWrapper}
        onMouseEnter={() => setCompareHover(true)}
        onMouseLeave={() => setCompareHover(false)}>
        <Link
          to="/compare"
          className={`${styles.iconLink} ${compareAnimation ? styles.cartJump : ''}`}
          aria-label={t('compare.title')}>
          <CompareIcon />
          {compareCount > 0 && <span className={styles.cartCount}>{compareCount}</span>}
        </Link>
        {compareHover && <CompareTooltip />}
      </div>
    </div>
  );
}
