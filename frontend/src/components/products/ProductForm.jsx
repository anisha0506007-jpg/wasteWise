import { useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Hash,
  Info,
  MapPin,
  Package,
  Ruler,
  Scale,
  ShieldCheck,
  Snowflake,
  Tag,
} from 'lucide-react';

import FormField from '../auth/FormField.jsx';
import Alert from '../common/Alert.jsx';
import Button from '../common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import {
  CONDITION_OPTIONS,
  PRODUCT_CATEGORIES,
  UNIT_OPTIONS,
} from '../../utils/productOptions.js';
import { toDateInput, toDateTimeLocalInput, toTimeInput } from '../../utils/productFormat.js';
import {
  parseLocalDateTime,
  validateProductForm,
  validateProductImage,
} from '../../utils/productValidators.js';
import ProductImageUpload from './ProductImageUpload.jsx';
import './ProductForm.css';

const EMPTY_VALUES = {
  name: '',
  description: '',
  category: '',
  totalQuantity: '',
  unit: '',
  manufacturingDate: '',
  expiryDate: '',
  expiryTime: '',
  pickupAddress: '',
  city: '',
  state: '',
  postalCode: '',
  pickupStartTime: '',
  pickupEndTime: '',
  pickupInstructions: '',
  condition: '',
  storageInstructions: '',
  dietaryInformation: '',
  confirmed: false,
};

const valuesFromProduct = (product) => ({
  name: product.name,
  description: product.description,
  category: product.category,
  totalQuantity: String(product.totalQuantity),
  unit: product.unit,
  manufacturingDate: product.manufacturingDate ? String(product.manufacturingDate).slice(0, 10) : '',
  expiryDate: toDateInput(product.expiryDate),
  expiryTime: product.expiryTime ? toTimeInput(product.expiryDate) : '',
  pickupAddress: product.pickupAddress,
  city: product.city,
  state: product.state,
  postalCode: product.postalCode,
  pickupStartTime: toDateTimeLocalInput(product.pickupStartTime),
  pickupEndTime: toDateTimeLocalInput(product.pickupEndTime),
  pickupInstructions: product.pickupInstructions,
  condition: product.condition,
  storageInstructions: product.storageInstructions,
  dietaryInformation: product.dietaryInformation,
  confirmed: false, // the owner must confirm again after any change
});

// Dates are sent as exact moments (UTC), so the server's time zone cannot shift them
const buildFormData = (values, imageFile, removeImage) => {
  const formData = new FormData();
  const expiry = parseLocalDateTime(values.expiryDate, values.expiryTime);

  [
    'name',
    'description',
    'category',
    'totalQuantity',
    'unit',
    'manufacturingDate',
    'expiryTime',
    'pickupAddress',
    'city',
    'state',
    'postalCode',
    'pickupInstructions',
    'condition',
    'storageInstructions',
    'dietaryInformation',
  ].forEach((key) => formData.append(key, values[key].trim()));

  formData.append('expiryDate', expiry.toISOString());
  formData.append('pickupStartTime', new Date(values.pickupStartTime).toISOString());
  formData.append('pickupEndTime', new Date(values.pickupEndTime).toISOString());
  formData.append('confirmed', String(values.confirmed));

  if (imageFile) formData.append('productImage', imageFile);
  else if (removeImage) formData.append('removeImage', 'true');

  return formData;
};

/**
 * Props:
 *  mode           - 'create' | 'edit'
 *  initialProduct - the product being edited (edit mode only)
 *  onSubmit(formData) - async function; throw on failure (the form shows the error)
 *  submitLabel    - text of the main button
 *  cancelTo       - route opened by the Cancel button
 */
function ProductForm({ mode = 'create', initialProduct = null, onSubmit, submitLabel, cancelTo }) {
  const { user } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState(() =>
    initialProduct
      ? valuesFromProduct(initialProduct)
      : {
          ...EMPTY_VALUES,
          // Convenient defaults from the business profile (the owner can change them)
          pickupAddress: user.address || '',
          city: user.city || '',
          state: user.state || '',
        }
  );
  const [imageFile, setImageFile] = useState(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const committed = initialProduct
    ? Math.round((initialProduct.totalQuantity - initialProduct.availableQuantity) * 100) / 100
    : 0;
  const unitLocked = committed > 0;
  const existingImageUrl =
    initialProduct?.image && !removeExisting ? getImageUrl(initialProduct.image) : '';
  const todayInput = toDateInput(new Date());

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageSelect = (file) => {
    const message = validateProductImage(file);
    if (message) {
      setImageFile(null);
      setErrors((prev) => ({ ...prev, productImage: message }));
      return;
    }
    setImageFile(file);
    setErrors((prev) => ({ ...prev, productImage: '' }));
  };

  // First click removes a newly chosen file; with none chosen it removes the saved image
  const handleImageRemove = () => {
    setErrors((prev) => ({ ...prev, productImage: '' }));
    if (imageFile) setImageFile(null);
    else setRemoveExisting(true);
  };

  const focusFirstError = () => {
    setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateProductForm(values, { original: initialProduct });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setFormError('Please fix the highlighted fields and try again.');
      focusFirstError();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(buildFormData(values, imageFile, removeExisting));
    } catch (error) {
      setErrors(getFieldErrors(error)); // server messages appear under the right fields
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
      focusFirstError();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="pf" onSubmit={handleSubmit} noValidate>
      {formError && <Alert type="error">{formError}</Alert>}

      {/* ---------- Product information ---------- */}
      <section className="pf-section">
        <h3 className="pf-section__title">
          <Package size={18} aria-hidden="true" /> Product information
        </h3>
        <div className="pf-grid">
          <FormField
            id="name"
            label="Product name"
            icon={Tag}
            required
            className="pf-full"
            placeholder="e.g. Whole Wheat Bread"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <FormField
            id="description"
            as="textarea"
            rows={3}
            label="Product description"
            icon={FileText}
            className="pf-full"
            placeholder="Describe the product, ingredients, or packaging"
            hint={`${values.description.length}/500 characters`}
            value={values.description}
            onChange={handleChange}
            error={errors.description}
          />
          <FormField
            id="category"
            as="select"
            label="Product category"
            required
            value={values.category}
            onChange={handleChange}
            error={errors.category}
          >
            <option value="">Select a category</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </FormField>
          <FormField
            id="condition"
            as="select"
            label="Product condition"
            icon={Snowflake}
            required
            value={values.condition}
            onChange={handleChange}
            error={errors.condition}
          >
            <option value="">Select the condition</option>
            {CONDITION_OPTIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </FormField>
          <FormField
            id="totalQuantity"
            label="Available quantity"
            icon={Scale}
            required
            inputMode="decimal"
            placeholder="e.g. 12.5"
            hint={
              mode === 'edit' && committed > 0
                ? `${committed} ${initialProduct.unit} is already reserved or collected, so the total cannot go lower.`
                : undefined
            }
            value={values.totalQuantity}
            onChange={handleChange}
            error={errors.totalQuantity}
          />
          <FormField
            id="unit"
            as="select"
            label="Quantity unit"
            icon={Ruler}
            required
            disabled={unitLocked}
            hint={unitLocked ? 'The unit is locked while stock is reserved or collected.' : undefined}
            value={values.unit}
            onChange={handleChange}
            error={errors.unit}
          >
            <option value="">Select a unit</option>
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </FormField>
        </div>
        <ProductImageUpload
          file={imageFile}
          existingUrl={existingImageUrl}
          onSelect={handleImageSelect}
          onRemove={handleImageRemove}
          error={errors.productImage}
        />
      </section>

      {/* ---------- Expiry information ---------- */}
      <section className="pf-section">
        <h3 className="pf-section__title">
          <Calendar size={18} aria-hidden="true" /> Expiry information
        </h3>
        <div className="pf-grid">
          <FormField
            id="manufacturingDate"
            type="date"
            label="Manufacturing date (optional)"
            max={todayInput}
            value={values.manufacturingDate}
            onChange={handleChange}
            error={errors.manufacturingDate}
          />
          <FormField
            id="expiryDate"
            type="date"
            label="Expiry date"
            required
            min={mode === 'create' ? todayInput : undefined}
            value={values.expiryDate}
            onChange={handleChange}
            error={errors.expiryDate}
          />
          <FormField
            id="expiryTime"
            type="time"
            label="Expiry time (if applicable)"
            icon={Clock}
            hint="Leave empty if the product expires at the end of the day."
            value={values.expiryTime}
            onChange={handleChange}
            error={errors.expiryTime}
          />
        </div>
      </section>

      {/* ---------- Pickup information ---------- */}
      <section className="pf-section">
        <h3 className="pf-section__title">
          <MapPin size={18} aria-hidden="true" /> Pickup information
        </h3>
        <div className="pf-grid">
          <FormField
            id="pickupAddress"
            as="textarea"
            rows={2}
            label="Pickup address"
            icon={MapPin}
            required
            className="pf-full"
            placeholder="Street, area, landmark"
            value={values.pickupAddress}
            onChange={handleChange}
            error={errors.pickupAddress}
          />
          <FormField id="city" label="City" required value={values.city} onChange={handleChange} error={errors.city} />
          <FormField id="state" label="State" required value={values.state} onChange={handleChange} error={errors.state} />
          <FormField
            id="postalCode"
            label="Postal code"
            icon={Hash}
            required
            autoComplete="postal-code"
            value={values.postalCode}
            onChange={handleChange}
            error={errors.postalCode}
          />
          <span className="pf-spacer" aria-hidden="true" />
          <FormField
            id="pickupStartTime"
            type="datetime-local"
            label="Pickup start time"
            required
            value={values.pickupStartTime}
            onChange={handleChange}
            error={errors.pickupStartTime}
          />
          <FormField
            id="pickupEndTime"
            type="datetime-local"
            label="Pickup end time"
            required
            value={values.pickupEndTime}
            onChange={handleChange}
            error={errors.pickupEndTime}
          />
          <FormField
            id="pickupInstructions"
            as="textarea"
            rows={2}
            label="Special pickup instructions"
            icon={Info}
            className="pf-full"
            placeholder="e.g. Use the rear entrance and ask for the manager"
            value={values.pickupInstructions}
            onChange={handleChange}
            error={errors.pickupInstructions}
          />
        </div>
      </section>

      {/* ---------- Additional information ---------- */}
      <section className="pf-section">
        <h3 className="pf-section__title">
          <Info size={18} aria-hidden="true" /> Additional information
        </h3>
        <div className="pf-grid">
          <FormField
            id="storageInstructions"
            as="textarea"
            rows={2}
            label="Storage instructions"
            className="pf-full"
            placeholder="e.g. Keep refrigerated below 5 C"
            value={values.storageInstructions}
            onChange={handleChange}
            error={errors.storageInstructions}
          />
          <FormField
            id="dietaryInformation"
            label="Dietary information (optional)"
            className="pf-full"
            placeholder="e.g. Vegetarian, contains nuts"
            value={values.dietaryInformation}
            onChange={handleChange}
            error={errors.dietaryInformation}
          />
        </div>
      </section>

      {/* ---------- Confirmation and buttons ---------- */}
      <section className="pf-section pf-section--confirm">
        <label className={`pf-confirm ${errors.confirmed ? 'pf-confirm--error' : ''}`}>
          <input
            type="checkbox"
            name="confirmed"
            checked={values.confirmed}
            onChange={handleChange}
            aria-invalid={errors.confirmed ? 'true' : undefined}
          />
          <span>
            <ShieldCheck size={16} aria-hidden="true" /> I confirm that the information above is
            accurate and that this product is safe for donation.
          </span>
        </label>
        {errors.confirmed && (
          <p className="form-error" role="alert">
            {errors.confirmed}
          </p>
        )}

        <div className="pf-actions">
          <Button type="submit" size="lg" loading={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
          <Button to={cancelTo} variant="ghost" size="lg" disabled={submitting}>
            Cancel
          </Button>
        </div>
      </section>
    </form>
  );
}

export default ProductForm;