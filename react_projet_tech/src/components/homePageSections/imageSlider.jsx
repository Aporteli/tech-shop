import { useEffect, useRef, useState } from 'react';
import styles from './imageSlider.module.css';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import usePointerDrag from '../../hooks/usePointerDrag';

export default function ImageSlider({ images = [], gap = 5, customClasses = {} }) {
  const initialTranslate = useRef(0);
  const sectionRef = useRef(null);
  const indexRef = useRef(0);
  const slideWidthRef = useRef(0);
  const lengthRef = useRef(0);

  const [imageIndex, setImageIndex] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);

  const DRAG_THRESHOLD = 20;

  indexRef.current = imageIndex;
  slideWidthRef.current = slideWidth;
  lengthRef.current = images.length;

  useEffect(() => {
    function updateWidth() {
      if (sectionRef.current) {
        const containerWidth = sectionRef.current.getBoundingClientRect().width;
        setSlideWidth(containerWidth);
        setTranslate(imageIndex * (containerWidth + gap));
      }
    }

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [imageIndex, gap]);

  const snapTo = index => {
    const maxIndex = Math.max(0, images.length - 1);
    const next = Math.min(maxIndex, Math.max(0, index));
    setImageIndex(next);
    setTranslate(next * (slideWidth + gap));
  };

  const { isDragging, dragHandlers } = usePointerDrag({
    onStart() {
      initialTranslate.current = translate;
    },
    onMove({ dx }) {
      setTranslate(initialTranslate.current - dx);
    },
    onEnd({ dx }) {
      let next = indexRef.current;
      if (dx < -DRAG_THRESHOLD) next += 1;
      else if (dx > DRAG_THRESHOLD) next -= 1;
      const width = slideWidthRef.current;
      const maxIndex = Math.max(0, lengthRef.current - 1);
      next = Math.min(maxIndex, Math.max(0, next));
      setImageIndex(next);
      setTranslate(next * (width + gap));
    }
  });

  const preventImgDrag = e => e.preventDefault();

  if (!images || images.length === 0) return null;

  return (
    <section
      className={`${styles.section} ${customClasses.section || ''}`}
      aria-label="Image Slider">
      <div className={`${styles.outerDiv} ${customClasses.outerDiv || ''}`} ref={sectionRef}>
        <div
          className={`${styles.sliderDiv} ${customClasses.sliderDiv || ''}`}
          style={{
            transform: `translateX(-${translate}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-in-out',
            gap: `${gap}px`
          }}
          {...dragHandlers}>
          {images.map(({ url, alt }, index) => (
            <div
              key={index}
              className={`${styles.imageContainer} ${customClasses.imageContainer || ''}`}>
              <OptimizedImage
                src={url}
                alt={alt || `Slide ${index + 1}`}
                aria-hidden={imageIndex !== index}
                className={`${styles.imgSliderImg} ${customClasses.img || ''}`}
                variant="hero"
                eager={index === 0}
                onDragStart={preventImgDrag}
              />
              <div className={`${styles.divOnImage} ${customClasses.overlay || ''}`} />
            </div>
          ))}
        </div>
        <div className={`${styles.dotsContainer} ${customClasses.dotsContainer || ''}`}>
          {images.map((_, index) => (
            <button
              type="button"
              key={index}
              className={`${styles.dot} ${imageIndex === index ? styles.dotActive : ''} ${customClasses.dot || ''}`}
              onClick={() => snapTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={imageIndex === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
