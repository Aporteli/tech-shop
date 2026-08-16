import styles from './compare.module.css';
import { useTranslation } from 'react-i18next';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CompareSearchModal from '../components/compareSearchModal/compareSearchModal';
import { fetchSubCateogryCompareScreenAttributes } from '../api/categoryService';
import { X, Plus, Trash2 } from 'lucide-react';
import emptyCompareImage from '../assets/pictures/compareToolTipPhoto.webp';
import OptimizedImage from '../components/OptimizedImage/OptimizedImage';

const MAX_COMPARE_ITEMS = 4;

export default function Compare() {
  const { t, i18n } = useTranslation();
  const { compareItems, removeFromCompare, clearCompare, toggleCompare, getCompareCategory } =
    useCompare();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [attributes, setAttributes] = useState(null);

  const compareCategory = getCompareCategory();

  useEffect(() => {
    if (!compareCategory) {
      setAttributes(null);
      return;
    }

    fetchSubCateogryCompareScreenAttributes(compareCategory, i18n.language.split('-')[0])
      .then(setAttributes)
      .catch(err => console.error(err));
  }, [compareCategory, i18n.language]);

  const handleAddProduct = product => {
    toggleCompare(product);
  };

  const emptySlots = Math.max(0, MAX_COMPARE_ITEMS - compareItems.length);

  if (compareItems.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{t('compare.title')}</h1>
          </div>
        </div>
        <div className={styles.emptyCard}>
          <img className={styles.emptyImage} src={emptyCompareImage} alt="" />
          <h2 className={styles.emptyTitle}>{t('compare.empty')}</h2>
          <p className={styles.emptyHint}>{t('compare.emptyHint')}</p>
          <button
            type="button"
            className={styles.addProductButton}
            onClick={() => setIsSearchModalOpen(true)}>
            <Plus size={18} />
            {t('compare.addProduct')}
          </button>
        </div>

        <CompareSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onProductSelect={handleAddProduct}
          currentCategory={compareCategory}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{t('compare.title')}</h1>
          <p className={styles.count}>
            {t('compare.itemsCount', { count: compareItems.length, max: MAX_COMPARE_ITEMS })}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => setIsSearchModalOpen(true)}
            disabled={emptySlots === 0}>
            <Plus size={16} />
            {t('compare.addProduct')}
          </button>
          <button type="button" className={styles.clearButton} onClick={clearCompare}>
            <Trash2 size={16} />
            {t('compare.clear')}
          </button>
        </div>
      </div>

      <div className={styles.compareTableContainer}>
        <table className={styles.compareTable}>
          <tbody>
            <tr className={styles.imageRow}>
              <td className={styles.attributeCell}>
                <span className={styles.attributeLabel}>{t('compare.product')}</span>
              </td>
              {compareItems.map(product => (
                <td key={`head-${product.id}`} className={styles.productCell}>
                  <div className={styles.productImageContainer}>
                    <button
                      type="button"
                      className={styles.removeProductButton}
                      aria-label={t('compare.remove')}
                      onClick={() => removeFromCompare(product.id)}>
                      <X size={16} />
                    </button>
                    <OptimizedImage
                      product={product}
                      alt=""
                      className={styles.productImage}
                      variant="thumb"
                    />
                  </div>
                  <Link to={`/product/${product.id}`} className={styles.productName}>
                    {product.name}
                  </Link>
                </td>
              ))}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <td key={`slot-${index}`} className={styles.emptyCell}>
                  <button
                    type="button"
                    className={styles.addMoreButton}
                    onClick={() => setIsSearchModalOpen(true)}>
                    <Plus size={22} />
                    {t('compare.addProduct')}
                  </button>
                </td>
              ))}
            </tr>

            <tr className={styles.dataRow}>
              <td className={styles.attributeCell}>
                <span className={styles.attributeLabel}>{t('compare.price')}</span>
              </td>
              {compareItems.map(product => {
                const discountPrice = Number(product.discount_price ?? product.discountPrice);
                const hasDiscount = discountPrice > 0 && discountPrice < Number(product.price);

                return (
                  <td key={`price-${product.id}`} className={styles.productCell}>
                    <div className={styles.productPrice}>
                      <span className={styles.currentPrice}>
                        {hasDiscount ? discountPrice : product.price} ₾
                      </span>
                      {hasDiscount && <span className={styles.oldPrice}>{product.price} ₾</span>}
                    </div>
                  </td>
                );
              })}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <td key={`empty-price-${index}`} className={styles.emptyCell}></td>
              ))}
            </tr>

            {attributes?.attributes?.map((attribute, attrIndex) => (
              <tr key={`attr-row-${attribute}-${attrIndex}`} className={styles.dataRow}>
                <td className={styles.attributeCell}>
                  <span className={styles.attributeLabel}>{attribute}</span>
                </td>

                {compareItems.map(product => {
                  const matchedAttr = product.attributes?.find(
                    item => item.attribute_name === attribute
                  );

                  return (
                    <td
                      key={`cell-${product.product_id || product.id}-${attrIndex}`}
                      className={styles.productCell}>
                      <span
                        className={`${styles.attributeValue} ${
                          matchedAttr ? '' : styles.attributeValueMissing
                        }`}>
                        {matchedAttr ? matchedAttr.attribute_value : '—'}
                      </span>
                    </td>
                  );
                })}

                {Array.from({ length: emptySlots }).map((_, emptyIndex) => (
                  <td key={`empty-${attribute}-${emptyIndex}`} className={styles.emptyCell}></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CompareSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onProductSelect={handleAddProduct}
        currentCategory={compareCategory}
      />
    </div>
  );
}
