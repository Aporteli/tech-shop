import { useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_IMAGE, getProductImageCandidates, toLocalImageSrc } from '../../utils/imageUrl';
import styles from './OptimizedImage.module.css';

export default function OptimizedImage({
  src,
  product,
  alt = '',
  className = '',
  variant = 'thumb',
  sizes,
  eager = false,
  onDragStart,
  ...rest
}) {
  const candidates = useMemo(() => {
    if (product) {
      return getProductImageCandidates(product, variant);
    }
    return [toLocalImageSrc(src), FALLBACK_IMAGE].filter(Boolean);
  }, [product, src, variant]);

  const [index, setIndex] = useState(0);
  const [loadedSrc, setLoadedSrc] = useState('');
  const imgRef = useRef(null);

  useEffect(() => {
    setIndex(0);
  }, [candidates]);

  const currentSrc = candidates[index] || FALLBACK_IMAGE;
  const loaded = loadedSrc === currentSrc;
  const fitClass = variant === 'hero' ? styles.cover : styles.contain;

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoadedSrc(currentSrc);
    }
  }, [currentSrc]);

  return (
    <span className={`${styles.frame} ${className}`}>
      {!loaded && (
        <span className={styles.placeholder} aria-hidden="true">
          <span className={styles.skeleton} />
        </span>
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        className={`${styles.image} ${fitClass} ${loaded ? styles.loaded : styles.pending}`}
        onLoad={() => setLoadedSrc(currentSrc)}
        onError={() => {
          if (index < candidates.length - 1) {
            setIndex(current => current + 1);
            return;
          }
          setLoadedSrc(currentSrc);
        }}
        onDragStart={onDragStart}
        {...rest}
      />
    </span>
  );
}
