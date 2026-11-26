import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';

import SmartImage from '../common/SmartImage.jsx';
import './ProductImageUpload.css';

/**
 * Props:
 *  file        - newly chosen File (or null)
 *  existingUrl - URL of the current saved image ('' when none or removed)
 *  onSelect(file), onRemove(), error
 */
function ProductImageUpload({ file, existingUrl = '', onSelect, onRemove, error }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Temporary browser URL for the preview, freed afterwards
  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (event) => {
    const selected = event.target.files?.[0];
    if (selected) onSelect(selected);
    event.target.value = ''; // lets the user pick the same file again
  };

  const hasImage = Boolean(file || existingUrl);

  return (
    <div className="form-group">
      <span className="form-label">Product image</span>

      <div className="piu">
        <div className="piu__preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Selected product preview" className="piu__img" />
          ) : existingUrl ? (
            <SmartImage className="piu__img" src={existingUrl} alt="Current product" fallbackIcon={ImagePlus} />
          ) : (
            <div className="piu__placeholder">
              <ImagePlus size={36} aria-hidden="true" />
              <span>No image selected</span>
            </div>
          )}
        </div>

        <div className="piu__actions">
          <input
            ref={inputRef}
            id="productImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleChange}
          />
          <button type="button" className="piu__button" onClick={() => inputRef.current?.click()}>
            <Camera size={16} aria-hidden="true" /> {hasImage ? 'Replace image' : 'Choose image'}
          </button>
          {hasImage && (
            <button type="button" className="piu__button piu__button--remove" onClick={onRemove}>
              <Trash2 size={16} aria-hidden="true" /> Remove
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="form-hint">JPG, JPEG, PNG, or WebP. Maximum 5 MB.</p>
      )}
    </div>
  );
}

export default ProductImageUpload;