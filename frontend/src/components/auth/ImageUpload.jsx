import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, User } from 'lucide-react';

import './ImageUpload.css';

function ImageUpload({ file, onSelect, onRemove, error }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Create a temporary browser URL for the preview, and free it afterwards
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
    event.target.value = ''; // lets the user pick the same file again later
  };

  return (
    <div className="form-group">
      <span className="form-label">Profile image (optional)</span>

      <div className="image-upload">
        <div className="image-upload__preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Selected profile preview" />
          ) : (
            <User size={32} aria-hidden="true" />
          )}
        </div>

        <div className="image-upload__actions">
          <input
            ref={inputRef}
            id="profileImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleChange}
          />
          <button
            type="button"
            className="image-upload__button"
            onClick={() => inputRef.current?.click()}
          >
            <Camera size={16} aria-hidden="true" />
            {file ? 'Change image' : 'Choose image'}
          </button>

          {file && (
            <button
              type="button"
              className="image-upload__button image-upload__button--remove"
              onClick={onRemove}
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="form-hint">JPG, PNG, or WebP. Maximum 2 MB.</p>
      )}
    </div>
  );
}

export default ImageUpload;