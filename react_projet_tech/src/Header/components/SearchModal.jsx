import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GrClearOption } from 'react-icons/gr';
import { IoIosSearch } from 'react-icons/io';
import { FaX } from 'react-icons/fa6';
import styles from '../Header.module.css';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';
import { API_URL } from '../../api/apiBase';

export default function SearchModal({
  openModal,
  closeModal,
  searchQuery,
  searchResults = { products: [], categories: [] },
  searchLoading,
  handleSearch,
  handleSearchSubmit,
  clearSearch,
  t
}) {
  const { i18n } = useTranslation();
  const inputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const productsList = searchResults?.products || [];
  const categoriesList = searchResults?.categories || [];

  useEffect(() => {
    if (!openModal) return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const onKeyDown = event => {
      if (event.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openModal, closeModal]);

  useEffect(() => {
    setSelectedCategory(null);
    setCategoryProducts([]);
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedCategory || searchQuery.trim().length < 2) {
      setCategoryProducts([]);
      setCategoryLoading(false);
      return;
    }

    const controller = new AbortController();
    setCategoryLoading(true);

    const fetchCategoryProducts = async () => {
      try {
        const lang = i18n.language.split('-')[0];
        const response = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(searchQuery)}&lang=${lang}&category=${encodeURIComponent(selectedCategory)}&limit=500`,
          { signal: controller.signal }
        );
        const data = await response.json();
        setCategoryProducts(data.products || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Category search error:', error);
          setCategoryProducts([]);
        }
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategoryProducts();
    return () => controller.abort();
  }, [selectedCategory, searchQuery, i18n.language]);

  if (!openModal) return null;

  const displayedProducts = selectedCategory ? categoryProducts : productsList;
  const isLoading = searchLoading || (selectedCategory && categoryLoading);

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-label={t('header.searchPlaceholder')}
        onClick={e => {
          e.stopPropagation();
        }}>
        <div className={styles.modalSearchToolbar}>
          <label className={styles.modalSearchField}>
            <IoIosSearch className={styles.modalSearchFieldIcon} aria-hidden="true" />
            <input
              ref={inputRef}
              className={styles.modalSearchFieldInput}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-label={t('header.searchPlaceholder')}
              placeholder={t('header.searchPlaceholder')}
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
          </label>
          <button
            type="button"
            className={styles.modalSearchClose}
            aria-label={t('header.close')}
            onClick={closeModal}>
            <FaX />
          </button>
        </div>

        <div className={styles.modalSearchBody}>
          {categoriesList.length > 0 && (
            <div className={styles.searchByCategory}>
              <h4 className={styles.categorySidebarTitle}>{t('header.modal.searchByCategory')}</h4>
              <ul className={styles.categoryList}>
                <li>
                  <button
                    type="button"
                    className={`${styles.categoryItem} ${selectedCategory === null ? styles.categoryItemActive : ''}`}
                    onClick={() => setSelectedCategory(null)}>
                    <span className={styles.categoryItemLabel}>{t('header.modal.allCategories')}</span>
                    <span className={styles.categoryItemCount}>{productsList.length}</span>
                  </button>
                </li>
                {categoriesList.map(cat => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      className={`${styles.categoryItem} ${selectedCategory === cat.slug ? styles.categoryItemActive : ''}`}
                      onClick={() => setSelectedCategory(cat.slug)}>
                      <span className={styles.categoryItemLabel}>{cat.name}</span>
                      <span className={styles.categoryItemCount}>{cat.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

        <div className={styles.modalSearchOutput}>
          <div className={styles.modalSearchOutputHeader}>
            <div className={styles.modalSearchOutputHeaderTitle}>{t('header.modal.searched')}</div>
            {searchQuery && (
              <button
                type="button"
                className={styles.modalSearchOutputHeaderClear}
                onClick={clearSearch}>
                <GrClearOption />
                <p className={styles.modalSearchOutputHeaderTitleClear}>
                  {t('header.modal.clear')}
                </p>
              </button>
            )}
          </div>

          <div className={styles.modalSearchOutputResults} aria-live="polite" aria-busy={isLoading}>
            {isLoading && <div className={styles.searchLoading}>{t('header.modal.loading')}</div>}

            {!isLoading && displayedProducts.length === 0 && searchQuery.length >= 2 && (
              <div className={styles.noResults}>{t('header.modal.noResults')}</div>
            )}

            {!isLoading && searchQuery.length < 2 && (
              <div className={styles.noResults}>{t('header.modal.prompt')}</div>
            )}

            {displayedProducts.map(product => (
              <div key={product.id} className={styles.searchResultItem}>
                <Link
                  to={`/product/${product.id}`}
                  className={styles.searchResultItemLink}
                  onClick={closeModal}>
                  <span className={styles.searchResultImage}>
                    <OptimizedImage product={product} alt={product.name} variant="thumb" />
                  </span>
                  <div className={styles.searchResultInfo}>
                    <h4 className={styles.searchResultName}>{product.name}</h4>
                    <p className={styles.searchResultPrice}>
                      {product.discount_price ? product.discount_price : product.price} ₾
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
