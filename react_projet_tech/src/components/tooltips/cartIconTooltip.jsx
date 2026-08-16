import styles from './cartIconTooltip.module.css';
import emptyCartImage from '../../assets/pictures/cartToolTipPhoto.webp';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import OptimizedImage from '../OptimizedImage/OptimizedImage';

export const CartIconTooltip = () => {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  if (cartItems.length === 0) {
    return (
      <>
        <div className={styles.hiddenDiv}></div>
        <div className={styles.tooltip}>
          <p className={styles.title}>{t('tooltip.cart.title')}</p>
          <p className={styles.description}>{t('tooltip.cart.subtitle')}</p>
          <img className={styles.emptyCartImage} src={emptyCartImage} alt="Empty cart" />
          <Link to="/cart" className={styles.continueShoppingButton}>
            {t('tooltip.cart.button')}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.hiddenDiv}></div>
      <div className={styles.tooltip}>
        <p className={cartItems.length > 0 ? styles.title : styles.titleDefault}>
          {cartItems.length > 0 ? t('tooltip.cart.yourList') : t('tooltip.cart.title')}
        </p>
        <div className={styles.cartItems}>
          {cartItems.map(item => {
            const currentPrice =
              Number(item.discountPrice) && Number(item.discountPrice) < Number(item.price)
                ? Number(item.discountPrice)
                : Number(item.price);
            return (
              <div key={item.id} className={styles.cartItem}>
                <OptimizedImage
                  className={styles.itemImage}
                  product={item}
                  alt={item.name}
                  variant="thumb"
                />
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <p className={styles.itemPrice}>{currentPrice} ₾</p>
                  <div className={styles.quantityControl}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                      <Minus size={12} />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <button className={styles.removeButton} onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
        <div className={styles.cartSummary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('tooltip.cart.subtotal') || 'Subtotal'}</span>
            <span className={styles.summaryValue}>{cartTotal.toFixed(2)} ₾</span>
          </div>
          <Link to="/cart" className={styles.viewCartButton}>
            {t('tooltip.cart.viewCart') || 'View Cart'}
          </Link>
        </div>
      </div>
    </>
  );
};
