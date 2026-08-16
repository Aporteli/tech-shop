import HeartIconLight from '../../../../icons/heartIconLight';
import HeartIconFilled from '../../../../icons/heartIconFilled';
import { ShoppingCart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../../context/CartContext';
import { useWishlist } from '../../../../context/WishlistContext';
import { useCompare } from '../../../../context/CompareContext';
import styles from './productCard.module.css';
import OptimizedImage from '../../../../components/OptimizedImage/OptimizedImage';

export default function ProductCard({ product, t }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();

  const discountPrice = Number(product.discount_price ?? product.discountPrice);
  const hasDiscount = discountPrice > 0 && discountPrice < Number(product.price);
  const currentP = hasDiscount ? discountPrice : Number(product.price);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = e => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlistToggle = e => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCompareToggle = e => {
    e.stopPropagation();
    toggleCompare(product);
  };

  const handleBuyNow = e => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className={styles.flexDiv}>
      <div className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className={styles.cardImageContainer}>
          <div className={styles.buttonsContainer}>
            <button
              type="button"
              className={`${styles.compareBtn} ${isInCompare(product.id) ? styles.compareBtnActive : ''}`}
              aria-label={t('singleProduct.addToCompare')}
              aria-pressed={isInCompare(product.id)}
              onClick={handleCompareToggle}>
              <RefreshCw size={18} />
            </button>
            <button
              type="button"
              className={styles.heartBtn}
              aria-label={t('singleProduct.addToWishlist')}
              aria-pressed={isInWishlist(product.id)}
              onClick={handleWishlistToggle}>
              {isInWishlist(product.id) ? <HeartIconFilled /> : <HeartIconLight />}
            </button>
          </div>
          <OptimizedImage
            className={styles.cardImage}
            product={product}
            alt={product.name}
            variant="thumb"
          />
        </div>
        <div className={styles.cardContent}>
          <h4 className={styles.productName}>{product.name}</h4>
          <div className={styles.priceSection}>
            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}>{currentP} ₾</span>
              {hasDiscount && <span className={styles.oldPrice}>{Number(product.price)} ₾</span>}
            </div>
          </div>
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.addToCartBtn}
              aria-label={t('singleProduct.addToCart')}
              onClick={handleAddToCart}>
              <ShoppingCart size={20} />
            </button>
            <button type="button" className={styles.buyNowBtn} onClick={handleBuyNow}>
              {t('discountSlider.buyNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
