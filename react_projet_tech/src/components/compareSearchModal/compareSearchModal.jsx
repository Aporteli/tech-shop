import { useEffect, useState } from 'react';
import { Search, X, PackageSearch, AlertCircle } from 'lucide-react';
import styles from './compareSearchModal.module.css';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../hooks/useModal';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import { API_URL as BASE_URL } from '../../api/apiBase';
const MIN_QUERY_LENGTH = 2;

export default function CompareSearchModal({ isOpen, onClose, onProductSelect, currentCategory }) {
  const { i18n, t } = useTranslation();
  useModal(isOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async query => {
    setSearchQuery(query);
    setErrorMessage('');

    if (query.length < MIN_QUERY_LENGTH) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const lang = i18n.language.split('-')[0];
      const encodedQuery = encodeURIComponent(query);

      const url = currentCategory
        ? `${BASE_URL}/api/compare/search?q=${encodedQuery}&lang=${lang}&category=${currentCategory}`
        : `${BASE_URL}/api/search?q=${encodedQuery}&lang=${lang}`;

      const response = await fetch(url);
      const rawData = await response.json();

      if (!response.ok) {
        throw new Error(rawData.message || 'Error occurred');
      }

      const normalizedProducts = currentCategory
        ? Array.isArray(rawData)
          ? rawData
          : rawData.products || []
        : rawData.products || (Array.isArray(rawData) ? rawData : []);

      setSearchResults(normalizedProducts);
    } catch (error) {
      console.error('Search error:', error.message);
      setErrorMessage(error.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = product => {
    onProductSelect(product);
    onClose();
    setSearchQuery('');
    setSearchResults([]);
    setErrorMessage('');
  };

  if (!isOpen) return null;

  const hasResults = searchResults.length > 0;
  const showSkeletons = isLoading && !hasResults;
  const showPrompt = !isLoading && !errorMessage && !hasResults && searchQuery.length < MIN_QUERY_LENGTH;
  const showNoResults =
    !isLoading && !errorMessage && !hasResults && searchQuery.length >= MIN_QUERY_LENGTH;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t('compare.addProduct')}
        onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t('compare.addProduct')}</h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label={t('compare.closeSearch')}
            onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('compare.searchPlaceholder')}
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />
          {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        </div>

        <div className={styles.resultsContainer} aria-live="polite" aria-busy={isLoading}>
          {errorMessage && (
            <div className={`${styles.stateBox} ${styles.errorBox}`}>
              <AlertCircle className={styles.stateIcon} size={30} />
              <span className={styles.stateTitle}>{errorMessage}</span>
              <span className={styles.stateHint}>{t('compare.searchErrorHint')}</span>
            </div>
          )}

          {showSkeletons &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className={styles.skeletonItem}>
                <span className={styles.skeletonThumb} />
                <span className={styles.skeletonLines}>
                  <span className={styles.skeletonLine} />
                  <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                </span>
              </div>
            ))}

          {hasResults && !errorMessage && (
            <div className={styles.resultsList}>
              {searchResults.map((product, index) => {
                const productId = product.product_id || product.id;
                const productName = product.product_name || product.name;
                const discountPrice = Number(product.discount_price ?? product.discountPrice);
                const hasDiscount = discountPrice > 0 && discountPrice < Number(product.price);

                return (
                  <button
                    type="button"
                    key={productId ? `prod-${productId}` : `item-${index}`}
                    className={styles.resultItem}
                    onClick={() => handleSelect(product)}>
                    <OptimizedImage
                      product={product}
                      alt=""
                      className={styles.resultImage}
                      variant="thumb"
                    />
                    <span className={styles.resultInfo}>
                      <span className={styles.resultName}>{productName}</span>
                      <span className={styles.resultPriceRow}>
                        <span className={styles.resultPrice}>
                          {hasDiscount ? discountPrice : product.price} ₾
                        </span>
                        {hasDiscount && (
                          <span className={styles.resultOldPrice}>{product.price} ₾</span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {showPrompt && (
            <div className={styles.stateBox}>
              <PackageSearch className={styles.stateIcon} size={30} />
              <span className={styles.stateTitle}>{t('compare.searchPrompt')}</span>
              <span className={styles.stateHint}>{t('compare.searchPromptHint')}</span>
            </div>
          )}

          {showNoResults && (
            <div className={styles.stateBox}>
              <PackageSearch className={styles.stateIcon} size={30} />
              <span className={styles.stateTitle}>{t('compare.noResults')}</span>
              <span className={styles.stateHint}>{t('compare.noResultsHint')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
