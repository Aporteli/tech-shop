import { useEffect, useRef, useState } from 'react';
import styles from './similarProductsSlider.module.css';
import HeartIconLight from '../../icons/heartIconLight';
import HeartIconFilled from '../../icons/heartIconFilled';
import { ChevronLeft, ChevronRight, ShoppingCart, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import usePointerDrag from '../../hooks/usePointerDrag';
import { API_URL as BASE_URL } from '../../api/apiBase';

export default function SimilarProductsSlider({ productId }) {
  const { t } = useTranslation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare, getCompareCategory } = useCompare();

  const initialTranslate = useRef(0);
  const wasDraggedForLink = useRef(false);
  const translateRef = useRef(0);
  const indexRef = useRef(0);
  const slideWidthRef = useRef(0);
  const visibleRef = useRef(5);
  const lengthRef = useRef(0);

  const outerDivRef = useRef(null);
  const sliderRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(5);
  const [slideWidth, setSlideWidth] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const DRAG_THRESHOLD = 20;
  const GAP = 16;

  translateRef.current = translate;
  indexRef.current = imageIndex;
  slideWidthRef.current = slideWidth;
  visibleRef.current = visibleSlides;
  lengthRef.current = products.length;

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/products/${productId}/similar?limit=10`);
        if (!response.ok) {
          throw new Error('Failed to fetch similar products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching similar products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId]);

  useEffect(() => {
    function updateLayout() {
      if (outerDivRef.current) {
        const containerWidth = outerDivRef.current.getBoundingClientRect().width;
        const windowWidth = window.innerWidth;
        let slidesToShow = 5;

        if (windowWidth < 580) {
          slidesToShow = 1;
        } else if (windowWidth < 990) {
          slidesToShow = 2;
        } else if (windowWidth < 1150) {
          slidesToShow = 3;
        } else if (windowWidth < 1350) {
          slidesToShow = 4;
        }

        setVisibleSlides(slidesToShow);
        const totalGapsWidth = GAP * (slidesToShow - 1);
        const newSlideWidth = (containerWidth - totalGapsWidth) / slidesToShow;
        setSlideWidth(newSlideWidth);

        const maxIndex = Math.max(0, products.length - slidesToShow);
        const safeIndex = imageIndex > maxIndex ? maxIndex : imageIndex;

        setImageIndex(safeIndex);
        setTranslate(safeIndex * (newSlideWidth + GAP));
      }
    }

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [products.length, imageIndex]);

  const showNextImage = () => {
    const maxIndex = Math.max(0, products.length - visibleSlides);
    if (imageIndex < maxIndex) {
      const newIndex = imageIndex + 1;
      setImageIndex(newIndex);
      setTranslate(newIndex * (slideWidth + GAP));
    }
  };

  const showPrevImage = () => {
    if (imageIndex > 0) {
      const newIndex = imageIndex - 1;
      setImageIndex(newIndex);
      setTranslate(newIndex * (slideWidth + GAP));
    }
  };

  const { isDragging, dragHandlers } = usePointerDrag({
    onStart() {
      initialTranslate.current = translateRef.current;
      wasDraggedForLink.current = false;
    },
    onMove({ dx }) {
      setTranslate(initialTranslate.current - dx);
      if (Math.abs(dx) > 5) wasDraggedForLink.current = true;
    },
    onEnd({ dx }) {
      let newIndex = indexRef.current;
      const width = slideWidthRef.current || 1;

      if (dx < -DRAG_THRESHOLD) {
        newIndex += Math.max(1, Math.round(Math.abs(dx) / width));
      } else if (dx > DRAG_THRESHOLD) {
        newIndex -= Math.max(1, Math.round(Math.abs(dx) / width));
      }

      const maxIndex = Math.max(0, lengthRef.current - visibleRef.current);
      newIndex = Math.min(maxIndex, Math.max(0, newIndex));
      setImageIndex(newIndex);
      setTranslate(newIndex * (width + GAP));
    }
  });

  const preventImgDrag = e => e.preventDefault();
  const stopDrag = e => e.stopPropagation();
  const handleClick = e => {
    if (wasDraggedForLink.current) e.preventDefault();
  };

  const handleWishlistToggle = (product, e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleCompareToggle = (product, e) => {
    e.preventDefault();
    const compareCategory = getCompareCategory();
    const productCategory = product.category_slug;
    const canCompare = !compareCategory || compareCategory === productCategory;

    if (canCompare) {
      toggleCompare(product);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (products.length === 0) {
    return null;
  }

  const formatPrice = price => {
    return price ? `${Number(price).toFixed(2)} ₾` : '';
  };

  const calculateDiscount = (price, discountPrice) => {
    if (!price || !discountPrice || Number(discountPrice) >= Number(price)) return null;
    const discount = ((Number(price) - Number(discountPrice)) / Number(price)) * 100;
    return Math.round(discount);
  };

  return (
    <div
      className={styles.mainDiv}
      onDragStart={preventImgDrag}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}>
      <h3 className={styles.title}>{t('singleProduct.similarProducts')}</h3>

      <div ref={outerDivRef} className={styles.outerDiv} {...dragHandlers}>
        <div
          ref={sliderRef}
          className={styles.sliderDiv}
          style={{
            transform: `translateX(-${translate}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
          }}>
          {products.map(product => {
            const discount = calculateDiscount(product.price, product.discount_price);
            const currentPrice = product.discount_price && Number(product.discount_price) < Number(product.price)
              ? product.discount_price
              : product.price;

            return (
              <div key={product.id} className={styles.flexDiv} style={{ flex: `0 0 ${slideWidth}px` }}>
                <Link to={`/product/${product.slug}`} onClick={handleClick} className={styles.card}>
                  <div className={styles.cardImageContainer}>
                    {discount && <span className={styles.discountBadge}>-{discount}%</span>}
                    <div className={styles.buttonsContainer}>
                      <button
                        type="button"
                        className={`${styles.compareBtn} ${isInCompare(product.id) ? styles.compareBtnActive : ''}`}
                        onClick={e => handleCompareToggle(product, e)}
                        onPointerDown={stopDrag}
                        aria-label={t('singleProduct.addToCompare')}
                        title={t('singleProduct.addToCompare')}>
                        <RefreshCw size={18} />
                      </button>
                      <button
                        type="button"
                        className={styles.heartBtn}
                        aria-label={t('singleProduct.addToWishlist')}
                        title={t('singleProduct.addToWishlist')}
                        onClick={e => handleWishlistToggle(product, e)}
                        onPointerDown={stopDrag}>
                        {isInWishlist(product.id) ? <HeartIconFilled /> : <HeartIconLight />}
                      </button>
                    </div>
                    <OptimizedImage
                      className={styles.cardImage}
                      product={product}
                      alt={product.name}
                      variant="thumb"
                      onDragStart={preventImgDrag}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h4 className={styles.productName}>{product.name}</h4>
                    <div className={styles.priceSection}>
                      <div className={styles.priceContainer}>
                        <span className={styles.currentPrice}>{formatPrice(currentPrice)}</span>
                        {product.discount_price && Number(product.discount_price) < Number(product.price) && (
                          <span className={styles.oldPrice}>{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.addToCartBtn}
                        aria-label={t('singleProduct.addToCart')}
                        title={t('singleProduct.addToCart')}
                        onClick={e => e.preventDefault()}
                        onPointerDown={stopDrag}>
                        <ShoppingCart size={20} />
                      </button>
                      <button
                        type="button"
                        className={styles.buyNowBtn}
                        onClick={e => e.preventDefault()}
                        onPointerDown={stopDrag}>
                        {t('discountSlider.buyNow')}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <button
          className={`${imageIndex === 0 ? styles.BtnStop : styles.Btn} ${styles.left}`}
          onClick={e => {
            e.stopPropagation();
            showPrevImage();
          }}
          onPointerDown={stopDrag}>
          <ChevronLeft size={24} />
        </button>
        <button
          className={`${
            imageIndex >= Math.max(0, products.length - visibleSlides) ? styles.BtnStop : styles.Btn
          } ${styles.right}`}
          onClick={e => {
            e.stopPropagation();
            showNextImage();
          }}
          onPointerDown={stopDrag}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
