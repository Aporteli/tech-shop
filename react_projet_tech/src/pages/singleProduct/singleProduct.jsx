import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, RefreshCw, Truck, ShieldCheck, BadgeCheck, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import HeartIconLight from '../../icons/heartIconLight';
import HeartIconFilled from '../../icons/heartIconFilled';
import styles from './singleProduct.module.css';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../hooks/useModal';
import SimilarProductsSlider from '../../components/similarProductsSlider/similarProductsSlider';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';
import { API_URL as BASE_URL } from '../../api/apiBase';

export default function SingleProduct() {
  const { i18n, t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [storageLoading, setStorageLoading] = useState(false);
  const [isAttributesExpanded, setIsAttributesExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const mainRef = useRef(null);
  const specsRef = useRef(null);
  const similarRef = useRef(null);

  useModal(isModalOpen);

  useEffect(() => {
    const sections = [
      { id: 'main', ref: mainRef },
      { id: 'specifications', ref: specsRef },
      { id: 'similar', ref: similarRef }
    ].filter(s => s.ref.current);

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.dataset.section) {
          setActiveTab(visible[0].target.dataset.section);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!product) {
          setLoading(true);
        }
        const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';
        const response = await fetch(`${BASE_URL}/api/products/${id}?lang=${currentLang}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, i18n.language]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  const handleCompareToggle = () => {
    if (product) {
      toggleCompare(product);
    }
  };

  const fetchBranches = async () => {
    if (!product) return;

    setBranchesLoading(true);
    setBranchesError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/products/${product.id}/branches`);
      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }
      const data = await response.json();
      setBranches(data);
    } catch (err) {
      setBranchesError(err.message);
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    fetchBranches();
  };

  const handleStorageClick = async storage => {
    if (storageLoading || storage === selectedStorage) return;

    setStorageLoading(true);
    setSelectedStorage(storage);

    try {
      const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';
      const response = await fetch(
        `${BASE_URL}/api/products/${id}/storage/${storage}?lang=${currentLang}`
      );

      if (!response.ok) {
        throw new Error('Product variant not found');
      }

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product variant:', err);
      setError(err.message);
    } finally {
      setStorageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonNav} />
          <div className={styles.skeletonHero}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonLine} style={{ width: '40%' }} />
              <div className={styles.skeletonLine} style={{ width: '85%', height: 28 }} />
              <div className={styles.skeletonCard}>
                <div className={styles.skeletonLine} style={{ width: '50%', height: 32 }} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            {error || t('singleProduct.productNotFound')}
            <button type="button" onClick={() => navigate('/')} className={styles.backButton}>
              {t('singleProduct.backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice =
    product.discount_price && Number(product.discount_price) < Number(product.price)
      ? Number(product.discount_price)
      : Number(product.price);

  const hasDiscount =
    product.discount_price && Number(product.discount_price) < Number(product.price);

  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)
    : 0;

  const savingsAmount = hasDiscount
    ? Math.round(Number(product.price) - Number(product.discount_price))
    : 0;

  const inStock = Number(product.stock) > 0;

  const scrollToSection = (tab, sectionId) => {
    setActiveTab(tab);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <nav className={styles.navigation} aria-label="Product sections">
            <button
              type="button"
              className={`${styles.navigationItem} ${activeTab === 'main' ? styles.navigationItemActive : ''}`}
              onClick={() => scrollToSection('main', 'main-section')}>
              {t('singleProduct.overview')}
            </button>
            <button
              type="button"
              className={`${styles.navigationItem} ${activeTab === 'specifications' ? styles.navigationItemActive : ''}`}
              onClick={() => scrollToSection('specifications', 'specifications-section')}>
              {t('singleProduct.specifications')}
            </button>
            <button
              type="button"
              className={`${styles.navigationItem} ${activeTab === 'similar' ? styles.navigationItemActive : ''}`}
              onClick={() => scrollToSection('similar', 'similar-section')}>
              {t('singleProduct.similarProducts')}
            </button>
          </nav>
        </div>

        <article
          className={styles.productHero}
          id="main-section"
          data-section="main"
          ref={mainRef}>
          <div className={styles.heroHeader}>
            <div className={styles.metaRow}>
              <button
                type="button"
                className={styles.categoryPill}
                onClick={() => navigate(`/s/${product.category_slug}`)}>
                {product.category_name}
              </button>
              <span
                className={`${styles.stockBadge} ${inStock ? styles.stockIn : styles.stockOut}`}>
                {inStock ? t('singleProduct.inStock') : t('singleProduct.outOfStock')}
              </span>
            </div>
            <h1 className={styles.productName}>{product.name}</h1>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.imageSection}>
              {hasDiscount && (
                <span className={styles.imageBadge}>-{discountPercent}%</span>
              )}
              <div className={styles.imageGlow} aria-hidden="true" />
              <OptimizedImage
                product={product}
                alt={product.name}
                className={styles.mainImage}
                variant="hero"
                eager
              />
            </div>

            <div className={styles.purchaseCard}>
              <div className={styles.priceSection}>
                <div className={styles.priceValues}>
                  <div className={styles.priceRow}>
                    {hasDiscount && (
                      <span className={styles.discountBadge}>-{discountPercent}%</span>
                    )}
                    <span className={styles.currentPrice}>{currentPrice} ₾</span>
                  </div>
                  {hasDiscount && (
                    <>
                      <span className={styles.oldPrice}>{Number(product.price)} ₾</span>
                      <span className={styles.savingsText}>
                        {t('singleProduct.youSave', { amount: savingsAmount })}
                      </span>
                    </>
                  )}
                </div>
                <button type="button" className={styles.priceInfo} onClick={handleModalOpen}>
                  <MapPin size={15} />
                  {t('singleProduct.checkPrice')}
                </button>
              </div>

              {product.short_description && (
                <p className={styles.shortDescription}>{product.short_description}</p>
              )}

              {product.available_storages && (
                <div className={styles.storageBlock}>
                  <p className={styles.storageLabel}>{t('singleProduct.storage')}</p>
                  <div className={styles.storages}>
                    {product.available_storages.map(storage => (
                      <button
                        type="button"
                        key={storage}
                        disabled={storageLoading}
                        className={`${styles.storageItem} ${selectedStorage === storage ? styles.storageItemSelected : ''} ${storageLoading ? styles.storageItemLoading : ''}`}
                        onClick={() => handleStorageClick(storage)}>
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.wishlistBtn}
                  aria-label={t('singleProduct.addToWishlist')}
                  aria-pressed={isInWishlist(product.id)}
                  onClick={handleWishlistToggle}>
                  {isInWishlist(product.id) ? <HeartIconFilled /> : <HeartIconLight />}
                </button>
                <button
                  type="button"
                  className={`${styles.compareBtn} ${isInCompare(product.id) ? styles.compareBtnActive : ''}`}
                  aria-label={t('singleProduct.addToCompare')}
                  aria-pressed={isInCompare(product.id)}
                  onClick={handleCompareToggle}>
                  <RefreshCw size={18} />
                </button>
                <button type="button" className={styles.addToCartBtn} onClick={handleAddToCart}>
                  <ShoppingCart size={18} />
                  <span>{t('singleProduct.addToCart')}</span>
                </button>
                <button type="button" className={styles.buyNowBtn}>
                  {t('singleProduct.buyNow')}
                </button>
              </div>

              <ul className={styles.highlights}>
                <li>
                  <Truck size={16} />
                  {t('singleProduct.freeDelivery')}
                </li>
                <li>
                  <ShieldCheck size={16} />
                  {t('singleProduct.warranty')}
                </li>
                <li>
                  <BadgeCheck size={16} />
                  {t('singleProduct.authentic')}
                </li>
              </ul>
            </div>
          </div>

          {product.description && (
            <div className={styles.descriptionCard}>
              <h3>{t('singleProduct.description')}</h3>
              <p className={styles.description}>{product.description}</p>
            </div>
          )}
        </article>

      {product.attributeGroups && product.attributeGroups.length > 0 && (
        <div
          className={styles.attributesSection}
          id="specifications-section"
          data-section="specifications"
          ref={specsRef}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.attributesTitle}>{t('singleProduct.specifications')}</h2>
            <span className={styles.sectionCount}>
              {product.attributeGroups.reduce((n, g) => n + g.attributes.length, 0)}{' '}
              {t('singleProduct.specsCount')}
            </span>
          </div>
          <div
            className={`${styles.attributesContent} ${isAttributesExpanded ? styles.expanded : ''}`}>
            {product.attributeGroups.map(group => (
              <div key={group.id || 'ungrouped'} className={styles.attributeGroup}>
                <h3 className={styles.attributeGroupName}>{group.name}</h3>
                <div className={styles.attributeGroupSeparator}></div>
                <div className={styles.attributesList}>
                  {group.attributes.map(attr => (
                    <div key={attr.id} className={styles.attributeItem}>
                      <span className={styles.attributeName}>{attr.name}</span>
                      <span className={styles.attributeValue}>{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.seeMoreButton}
            onClick={() => setIsAttributesExpanded(!isAttributesExpanded)}>
            {isAttributesExpanded ? t('singleProduct.showLess') : t('singleProduct.seeMore')}
          </button>
        </div>
      )}

      <div
        className={styles.similarSection}
        id="similar-section"
        data-section="similar"
        ref={similarRef}>
        <SimilarProductsSlider productId={product.id} />
      </div>

      <div className={styles.mobileBuyBar}>
        <div className={styles.mobileBuyPrice}>
          <span className={styles.mobileBuyAmount}>{currentPrice} ₾</span>
          {hasDiscount && (
            <span className={styles.mobileBuyOld}>{Number(product.price)} ₾</span>
          )}
        </div>
        <button type="button" className={styles.mobileBuyBtn} onClick={handleAddToCart}>
          <ShoppingCart size={18} />
          {t('singleProduct.addToCart')}
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('singleProduct.availableAddresses')}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {branchesLoading ? (
                <div className={styles.loading}>{t('singleProduct.loading')}</div>
              ) : branchesError ? (
                <div className={styles.error}>{branchesError}</div>
              ) : branches.length === 0 ? (
                <p className={styles.noAddresses}>{t('singleProduct.noAddresses')}</p>
              ) : (
                <div className={styles.branchList}>
                  {branches.map(branch => (
                    <div key={branch.id} className={styles.branchItem}>
                      <div className={styles.branchName}>{branch.name}</div>
                      {branch.address && (
                        <div className={styles.branchAddress}>{branch.address}</div>
                      )}
                      <div className={styles.branchQuantity}>
                        {t('singleProduct.quantity')}: {branch.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
