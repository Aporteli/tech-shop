import { useRef, useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import styles from './logoSlider.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import samsung from '../../assets/pictures/homePagePhotos/logoSliderImages/samsung.webp';
import apple from '../../assets/pictures/homePagePhotos/logoSliderImages/apple.webp';
import sony from '../../assets/pictures/homePagePhotos/logoSliderImages/sony.webp';
import lenovo from '../../assets/pictures/homePagePhotos/logoSliderImages/lenovo.webp';
import asus from '../../assets/pictures/homePagePhotos/logoSliderImages/asus.webp';
import lg from '../../assets/pictures/homePagePhotos/logoSliderImages/lg.webp';
import tcl from '../../assets/pictures/homePagePhotos/logoSliderImages/tcl.webp';
import honor from '../../assets/pictures/homePagePhotos/logoSliderImages/honor.webp';
import electrolux from '../../assets/pictures/homePagePhotos/logoSliderImages/electrolux.webp';
import philips from '../../assets/pictures/homePagePhotos/logoSliderImages/philips.webp';
import panasonic from '../../assets/pictures/homePagePhotos/logoSliderImages/panasonic.webp';
import delonghi from '../../assets/pictures/homePagePhotos/logoSliderImages/delonghi.webp';
import toshiba from '../../assets/pictures/homePagePhotos/logoSliderImages/toshiba.webp';
import aeg from '../../assets/pictures/homePagePhotos/logoSliderImages/aeg.webp';
import marley from '../../assets/pictures/homePagePhotos/logoSliderImages/marley.webp';
import tplink from '../../assets/pictures/homePagePhotos/logoSliderImages/tplink.webp';
import sencor from '../../assets/pictures/homePagePhotos/logoSliderImages/sencor.webp';

const logoImages = [
  { src: samsung, alt: 'Samsung', slug: 'samsung' },
  { src: apple, alt: 'Apple', slug: 'apple' },
  { src: sony, alt: 'Sony', slug: 'sony' },
  { src: lenovo, alt: 'Lenovo', slug: 'lenovo' },
  { src: asus, alt: 'Asus', slug: 'asus' },
  { src: lg, alt: 'LG', slug: 'lg' },
  { src: tcl, alt: 'TCL', slug: 'tcl' },
  { src: honor, alt: 'Honor', slug: 'honor' },
  { src: electrolux, alt: 'Electrolux', slug: 'electrolux' },
  { src: philips, alt: 'Philips', slug: 'philips' },
  { src: panasonic, alt: 'Panasonic', slug: 'panasonic' },
  { src: delonghi, alt: "De'Longhi", slug: 'de-longhi' },
  { src: toshiba, alt: 'Toshiba', slug: 'toshiba' },
  { src: aeg, alt: 'AEG', slug: 'aeg' },
  { src: marley, alt: 'Marley', slug: 'house-of-marley' },
  { src: tplink, alt: 'TP-Link', slug: 'tp-link' },
  { src: sencor, alt: 'Sencor', slug: 'sencor' }
];

export default function LogoSlider() {
  const { t } = useTranslation();
  const sliderRef = useRef(null);
  const velocityRef = useRef(0);
  const animationRef = useRef(null);
  const buttonIntervalRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const didMoveRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const pointerStartXRef = useRef(0);
  const startScrollRef = useRef(0);

  const CLICK_THRESHOLD = 8;

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  useEffect(() => {
    isAtEnd;
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      slider.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    checkScrollPosition();
    if (!pointerActiveRef.current || !sliderRef.current) return;
    const scrolled = Math.abs(sliderRef.current.scrollLeft - startScrollRef.current);
    if (scrolled > CLICK_THRESHOLD) didMoveRef.current = true;
  };

  const checkScrollPosition = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    const { scrollLeft, clientWidth, scrollWidth } = slider;

    setIsAtStart(scrollLeft <= 5);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 5);
  };

  // --- მთავარი ანიმაციის ციკლი (სრიალი და შენელება) ---
  const animateScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    if (Math.abs(velocityRef.current) < 0.1) {
      velocityRef.current = 0;
      checkScrollPosition();
      return;
    }
    slider.scrollLeft += velocityRef.current;
    if (!buttonIntervalRef.current) {
      velocityRef.current *= 0.94;
      checkScrollPosition();
    }

    animationRef.current = requestAnimationFrame(animateScroll);
  };

  // ანიმაციის უსაფრთხო დაწყება
  const startAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (buttonIntervalRef.current) clearInterval(buttonIntervalRef.current);
    };
  }, []);

  // --- ისრებზე დაჭერის (Hold და Click) ახალი ლოგიკა ---
  const handleArrowPress = direction => {
    if (buttonIntervalRef.current) clearInterval(buttonIntervalRef.current);
    const speedStep = direction === 'left' ? -2 : 2;
    const initialImpulse = direction === 'left' ? -10 : 10;
    velocityRef.current = initialImpulse;
    startAnimation();
    buttonIntervalRef.current = setInterval(() => {
      velocityRef.current = speedStep * 3;
    }, 50);
  };

  const handleArrowRelease = () => {
    // როგორც კი ღილაკს ხელს ავუშვებთ, ინტერვალს ვთიშავთ
    if (buttonIntervalRef.current) {
      clearInterval(buttonIntervalRef.current);
      buttonIntervalRef.current = null;
    }
  };

  // --- მაუსით/თითით გაწევის (Drag) ლოგიკა ---
  const handlePointerDown = e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    pointerActiveRef.current = true;
    didMoveRef.current = false;
    draggingRef.current = false;
    pointerStartXRef.current = e.clientX;
    startScrollRef.current = sliderRef.current.scrollLeft;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;

    velocityRef.current = 0;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handlePointerMove = e => {
    if (!pointerActiveRef.current) return;

    const dx = e.clientX - pointerStartXRef.current;
    if (Math.abs(dx) > CLICK_THRESHOLD) didMoveRef.current = true;

    // Finger scrolling is native. Mouse drag starts only after the slider actually moves.
    if (e.pointerType === 'touch') return;
    if (Math.abs(dx) <= CLICK_THRESHOLD && !draggingRef.current) return;

    if (!draggingRef.current) {
      draggingRef.current = true;
      setIsDragging(true);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }

    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    sliderRef.current.scrollLeft = scrollLeftRef.current - (x - startXRef.current);
    checkScrollPosition();
  };

  const handlePointerUp = e => {
    if (!pointerActiveRef.current) return;

    const scrolled = Math.abs(sliderRef.current.scrollLeft - startScrollRef.current);
    if (scrolled > CLICK_THRESHOLD) didMoveRef.current = true;

    pointerActiveRef.current = false;
    draggingRef.current = false;
    setIsDragging(false);
    handleArrowRelease();
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleLogoClick = e => {
    if (didMoveRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.sliderWrapper}>
        <h2 className={styles.brandsTitle}>{t('brands.title')}</h2>
        <div className={styles.arraws_slider}>
          <div className={styles.buttonsContainer}>
            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.left} ${isAtStart ? styles.disabled : ''}`}
              aria-label={t('brands.prev', { defaultValue: 'Previous brands' })}
              onPointerDown={() => handleArrowPress('left')}
              onPointerUp={handleArrowRelease}
              onPointerLeave={handleArrowRelease}
              onPointerCancel={handleArrowRelease}>
              <FaChevronLeft />
            </button>

            <button
              type="button"
              className={`${styles.arrowBtn} ${styles.right} ${isAtEnd ? styles.disabled : ''}`}
              aria-label={t('brands.next', { defaultValue: 'Next brands' })}
              onPointerDown={() => handleArrowPress('right')}
              onPointerUp={handleArrowRelease}
              onPointerLeave={handleArrowRelease}
              onPointerCancel={handleArrowRelease}>
              <FaChevronRight />
            </button>
          </div>
          <div
            className={`${styles.sliderContainer} ${isDragging ? styles.grabbing : ''}`}
            ref={sliderRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClickCapture={handleLogoClick}>
            {logoImages.map(({ src, alt, slug }, index) => (
              <div className={styles.categoryItemInner} key={slug || index}>
                <Link
                  draggable="false"
                  className={styles.logoLink}
                  to={`/brand/${slug}`}
                  onClick={handleLogoClick}
                  onDragStart={e => e.preventDefault()}>
                  <img className={styles.logoImage} src={src} alt={alt} draggable="false" />
                </Link>
              </div>
            ))}
          </div>
  
          {/* მარჯვენა ისარი */}
        </div>
      </div>
    </div>
  );
}
