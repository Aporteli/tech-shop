import styles from './cart.module.css';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import emptyCartImage from '../assets/pictures/cartToolTipPhoto.webp';
import OptimizedImage from '../components/OptimizedImage/OptimizedImage';

const formatPrice = value => `${Number(value).toFixed(2)} ₾`;

const getUnitPrice = item => {
  const price = Number(item.price);
  const discount = Number(item.discount_price ?? item.discountPrice);
  return discount > 0 && discount < price ? discount : price;
};

export default function Cart() {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('cart.title')}</h1>
        </div>
        <div className={styles.emptyCard}>
          <img className={styles.emptyImage} src={emptyCartImage} alt="" />
          <h2 className={styles.emptyTitle}>{t('cart.empty')}</h2>
          <p className={styles.emptyHint}>{t('cart.emptyHint')}</p>
          <Link to="/" className={styles.continueShopping}>
            {t('cart.continueShopping')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('cart.title')}</h1>
        <p className={styles.count}>{t('cart.itemsCount', { count: itemCount })}</p>
      </div>

      <div className={styles.layout}>
        <ul className={styles.itemsPanel}>
          {cartItems.map(item => {
            const unitPrice = getUnitPrice(item);
            const hasDiscount = unitPrice < Number(item.price);
            const productPath = `/product/${item.slug || item.id}`;

            return (
              <li key={item.id} className={styles.cartItem}>
                <Link to={productPath} className={styles.itemImageLink} tabIndex={-1} aria-hidden="true">
                  <OptimizedImage
                    className={styles.itemImage}
                    product={item}
                    alt=""
                    variant="thumb"
                  />
                </Link>

                <div className={styles.itemInfo}>
                  <Link to={productPath} className={styles.itemName}>
                    {item.name}
                  </Link>
                  <p className={styles.priceRow}>
                    <span className={styles.itemPrice}>{formatPrice(unitPrice)}</span>
                    {hasDiscount && (
                      <span className={styles.oldPrice}>{formatPrice(item.price)}</span>
                    )}
                  </p>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button
                      type="button"
                      className={styles.quantityButton}
                      aria-label={t('cart.decrease')}
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={16} />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles.quantityButton}
                      aria-label={t('cart.increase')}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>

                  <span className={styles.lineTotal}>
                    {formatPrice(unitPrice * item.quantity)}
                  </span>

                  <button
                    type="button"
                    className={styles.removeButton}
                    aria-label={t('cart.remove')}
                    onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className={styles.cartSummary}>
          <h2 className={styles.summaryTitle}>{t('cart.summary')}</h2>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('cart.subtotal')}</span>
            <span className={styles.summaryValue}>{formatPrice(cartTotal)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t('cart.shipping')}</span>
            <span className={styles.summaryFree}>{t('cart.freeShipping')}</span>
          </div>

          <div className={styles.summaryDivider} />

          <div className={styles.summaryTotalRow}>
            <span className={styles.summaryTotalLabel}>{t('cart.total')}</span>
            <span className={styles.summaryTotalValue}>{formatPrice(cartTotal)}</span>
          </div>

          <button type="button" className={styles.checkoutButton}>
            {t('cart.checkout')}
          </button>

          <Link to="/" className={styles.continueLink}>
            {t('cart.continueShopping')}
          </Link>
        </aside>
      </div>
    </div>
  );
}
