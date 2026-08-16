import { useEffect, useRef, useState } from 'react';
import styles from './giftSlider.module.css';
import HeartIconLight from '../../icons/heartIconLight';
import HeartIconFilled from '../../icons/heartIconFilled';
import { ChevronLeft, ChevronRight, ShoppingCart, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { normalizeSliderItem } from './sliderUtils';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import usePointerDrag from '../../hooks/usePointerDrag';

export default function GiftSlider({ images = [] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
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

  const [imageIndex, setImageIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(5);
  const [slideWidth, setSlideWidth] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [isForward, setIsForward] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const DRAG_THRESHOLD = 20;
  const GAP = 16;

  translateRef.current = translate;
  indexRef.current = imageIndex;
  slideWidthRef.current = slideWidth;
  visibleRef.current = visibleSlides;
  lengthRef.current = images.length;

  // 1. ეკრანის ზომის და სიგანის გამოთვლა (ImageSlider-ის მსგავსად)
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

        // უსაფრთხო ინდექსი ფანჯრის ზომის შეცვლისას
        const maxIndex = Math.max(0, images.length - slidesToShow);
        const safeIndex = imageIndex > maxIndex ? maxIndex : imageIndex;

        setImageIndex(safeIndex);
        setTranslate(safeIndex * (newSlideWidth + GAP));
      }
    }

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [images.length, imageIndex]); // updateLayout-ის ლოგიკა გადაკეთდა ზუსტ გათვლებზე

  // 2. ავტომატური სლაიდერი
  useEffect(() => {
    if (isDragging || isPaused) return;
    const interval = setInterval(() => {
      if (isForward) {
        showNextImage();
      } else {
        showPrevImage();
      }
    }, 3000);
    return () => clearInterval(interval);
  });

  // 3. ღილაკების სინქრონული ლოგიკა (ImageSlider-ის პრინციპით)
  const showNextImage = () => {
    const maxIndex = Math.max(0, images.length - visibleSlides);
    if (imageIndex < maxIndex) {
      const newIndex = imageIndex + 1;
      setImageIndex(newIndex);
      setTranslate(newIndex * (slideWidth + GAP));
    } else {
      setIsForward(false);
    }
  };

  const showPrevImage = () => {
    if (imageIndex > 0) {
      const newIndex = imageIndex - 1;
      setImageIndex(newIndex);
      setTranslate(newIndex * (slideWidth + GAP));
    } else {
      setIsForward(true);
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
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCompareToggle = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div
      className={styles.mainDiv}
      onDragStart={preventImgDrag}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}>
      <h3 className={styles.title}>{t('giftSlider.title')}</h3>

      <div ref={outerDivRef} className={styles.outerDiv} {...dragHandlers}>
        <div
          ref={sliderRef}
          className={styles.sliderDiv}
          style={{
            transform: `translateX(-${translate}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-in-out'
          }}>
          {images.map((item, index) => {
            const slide = normalizeSliderItem(item, index);
            const { product, id, name, url, route, displayPrice, displayOldPrice, discount, alt } =
              slide;
            const compareCategory = getCompareCategory();
            const canCompare =
              !compareCategory || String(compareCategory) === String(product.category_id);

            return (
              <div key={id} className={styles.flexDiv} style={{ flex: `0 0 ${slideWidth}px` }}>
                <Link to={route} onClick={handleClick} className={styles.card}>
                  <div className={styles.cardImageContainer}>
                    {discount && <span className={styles.discountBadge}>-{discount}%</span>}
                    <div className={styles.buttonsContainer}>
                      <button
                        type="button"
                        className={`${styles.compareBtn} ${isInCompare(id) ? styles.compareBtnActive : ''}`}
                        onClick={e => handleCompareToggle(product, e)}
                        onPointerDown={stopDrag}
                        disabled={!canCompare}
                        title={
                          !canCompare ? 'Cannot compare products from different categories' : ''
                        }>
                        <RefreshCw size={18} />
                      </button>
                      <button
                        type="button"
                        className={styles.heartBtn}
                        onClick={e => handleWishlistToggle(product, e)}
                        onPointerDown={stopDrag}>
                        {isInWishlist(id) ? <HeartIconFilled /> : <HeartIconLight />}
                      </button>
                    </div>
                    <OptimizedImage
                      className={styles.cardImage}
                      product={product}
                      src={url}
                      alt={alt}
                      variant="thumb"
                      onDragStart={preventImgDrag}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h4 className={styles.productName}>{name || alt}</h4>
                    <div className={styles.priceSection}>
                      <div className={styles.priceContainer}>
                        <span className={styles.currentPrice}>{displayPrice}</span>
                        {displayOldPrice && <span className={styles.oldPrice}>{displayOldPrice}</span>}
                      </div>
                      <div className={styles.perMonthFrom}>
                        {t('discountSlider.perMonthFrom', { price: displayPrice })}
                      </div>
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.addToCartBtn}
                        onClick={e => handleAddToCart(product, e)}
                        onPointerDown={stopDrag}>
                        <ShoppingCart size={20} />
                      </button>
                      <button
                        type="button"
                        className={styles.buyNowBtn}
                        onClick={e => handleBuyNow(product, e)}
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

        {/* ღილაკებზე მოვლენის შეჩერება კონფლიქტის ასაცილებლად */}
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
            imageIndex >= Math.max(0, images.length - visibleSlides) ? styles.BtnStop : styles.Btn
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
