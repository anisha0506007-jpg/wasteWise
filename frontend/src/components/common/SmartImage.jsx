import { useEffect, useRef, useState } from 'react';
import { Leaf } from 'lucide-react';

import './SmartImage.css';
function SmartImage({
  src,
  alt,
  className = '',
  priority = false,
  fallbackIcon: FallbackIcon = Leaf,
}) {
  const imageRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | loaded | error

  // Handles images that finished loading (or failed) before React was ready
  useEffect(() => {
    const image = imageRef.current;
    if (image && image.complete) {
      setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, [src]);

  return (
    <div className={`smart-image smart-image--${status} ${className}`}>
      {status === 'loading' && (
        <span className="smart-image__skeleton" aria-hidden="true" />
      )}

      {status === 'error' ? (
        <div className="smart-image__fallback" role="img" aria-label={alt}>
          <FallbackIcon size={56} strokeWidth={1.5} aria-hidden="true" />
        </div>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="smart-image__img"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}

export default SmartImage;