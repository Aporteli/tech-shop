import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './brand.module.css';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';

const BASE_URL = 'http://localhost:5001';

function getVisiblePages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [1];

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  pages.push(total);
  return pages;
}

export default function Brand() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [slug]);

  useEffect(() => {
    const fetchBrandProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentLang = i18n.language?.split('-')[0] || 'en';
        const response = await fetch(
          `${BASE_URL}/api/products/brand/${slug}?lang=${currentLang}&page=${currentPage}&limit=12`
        );

        if (!response.ok) {
          throw new Error('Brand not found');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBrandProducts();
    }
  }, [slug, currentPage, i18n.language]);

  const handlePageChange = page => {
    if (page < 1 || (data && page > data.pagination.totalPages)) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = price => (price ? `${Number(price).toFixed(2)} ₾` : '');

  const calculateDiscount = (price, discountPrice) => {
    if (!price || !discountPrice || Number(discountPrice) >= Number(price)) return null;
    const discount = ((Number(price) - Number(discountPrice)) / Number(price)) * 100;
    return Math.round(discount);
  };

  if (loading) {
    return (
      <div className={styles.container} aria-busy="true">
        <div className={styles.skeletonHero} />
        <div className={styles.productsGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.stateCard}>
          <h1 className={`${styles.stateTitle} ${styles.stateTitleError}`}>
            {t('brand.brandNotFound')}
          </h1>
          <p className={styles.stateHint}>{t('brand.notFoundHint')}</p>
          <Link to="/" className={styles.backButton}>
            {t('brand.backToHome')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const { brand, products, pagination } = data;
  const visiblePages = getVisiblePages(currentPage, pagination.totalPages);

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link to="/">{t('brand.backToHome')}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{brand.name}</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.brandTitle}>{brand.name}</h1>
          <p className={styles.brandSubtitle}>
            {t('brand.productsCount', { count: pagination.total })}
          </p>
        </div>
      </header>

      {products.length === 0 ? (
        <div className={styles.stateCard}>
          <h2 className={styles.stateTitle}>{t('brand.noProducts')}</h2>
          <p className={styles.stateHint}>{t('brand.noProductsHint')}</p>
        </div>
      ) : (
        <>
          <div className={styles.productsGrid}>
            {products.map(product => {
              const discount = calculateDiscount(product.price, product.discount_price);
              const hasDiscount = discount !== null;

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className={styles.productCard}>
                  <div className={styles.productImageContainer}>
                    {hasDiscount && <span className={styles.discountBadge}>-{discount}%</span>}
                    <OptimizedImage
                      className={styles.productImage}
                      product={product}
                      alt=""
                      variant="thumb"
                    />
                  </div>
                  <div className={styles.productContent}>
                    {product.category_name && (
                      <span className={styles.categoryTag}>{product.category_name}</span>
                    )}
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.priceSection}>
                      <span className={styles.currentPrice}>
                        {formatPrice(hasDiscount ? product.discount_price : product.price)}
                      </span>
                      {hasDiscount && (
                        <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <nav className={styles.pagination} aria-label={t('brand.pagination')}>
                <button
                  type="button"
                  className={`${styles.pageButton} ${styles.pageNav}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}>
                  <ChevronLeft size={14} />
                  {t('brand.previous')}
                </button>

                <div className={styles.pageNumbers}>
                  {visiblePages.map((page, index) =>
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                        onClick={() => handlePageChange(page)}>
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className={`${styles.pageButton} ${styles.pageNav}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}>
                  {t('brand.next')}
                  <ChevronRight size={14} />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
