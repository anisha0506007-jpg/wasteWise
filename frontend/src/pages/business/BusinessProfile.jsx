import { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  User,
  X,
} from 'lucide-react';

import FormField from '../../components/auth/FormField.jsx';
import ImageUpload from '../../components/auth/ImageUpload.jsx';
import Alert from '../../components/common/Alert.jsx';
import Button from '../../components/common/Button.jsx';
import BusinessCard from '../../components/business/BusinessCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { updateBusinessProfile } from '../../services/businessService.js';
import { getErrorMessage, getFieldErrors } from '../../utils/errors.js';
import { formatDate, getInitials } from '../../utils/format.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { validateBusinessProfile } from '../../utils/profileValidators.js';
import { BUSINESS_TYPES } from '../../utils/roles.js';
import { validateImageFile } from '../../utils/validators.js';
import './BusinessProfile.css';

const valuesFromUser = (user) => ({
  name: user.name || '',
  organizationName: user.organizationName || '',
  businessType: user.businessType || '',
  phone: user.phone || '',
  address: user.address || '',
  city: user.city || '',
  state: user.state || '',
});

function BusinessProfile() {
  const { user, fetchCurrentUser } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() => valuesFromUser(user));
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const businessName = user.organizationName || user.name;
  const imageUrl = getImageUrl(user.profileImage);

  const startEditing = () => {
    setValues(valuesFromUser(user));
    setImageFile(null);
    setErrors({});
    setFormError('');
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageSelect = (file) => {
    const message = validateImageFile(file);
    if (message) {
      setImageFile(null);
      setErrors((prev) => ({ ...prev, profileImage: message }));
      return;
    }
    setImageFile(file);
    setErrors((prev) => ({ ...prev, profileImage: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateBusinessProfile(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setFormError('Please fix the highlighted fields and try again.');
      return;
    }

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value.trim()));
    if (imageFile) formData.append('profileImage', imageFile);

    setSaving(true);
    try {
      await updateBusinessProfile(formData);
      await fetchCurrentUser(); // refresh AuthContext so the header shows the new details
      toast.success('Business profile updated.');
      setEditing(false);
    } catch (error) {
      setErrors(getFieldErrors(error));
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const details = [
    { icon: Building2, label: 'Business name', value: user.organizationName },
    { icon: User, label: 'Owner name', value: user.name },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone },
    { icon: Briefcase, label: 'Business type', value: user.businessType },
    { icon: MapPin, label: 'Address', value: user.address },
    { icon: MapPin, label: 'City', value: user.city },
    { icon: MapPin, label: 'State', value: user.state },
  ];

  return (
    <div className="bp">
      <BusinessCard>
        <div className="bp-hero">
          <span className="bp-hero__avatar">
            {imageUrl ? <img src={imageUrl} alt={`${businessName} profile`} /> : getInitials(businessName)}
          </span>
          <div className="bp-hero__info">
            <h2>{businessName}</h2>
            <p>
              <Calendar size={14} aria-hidden="true" /> Member since {formatDate(user.createdAt)}
            </p>
          </div>
          {!editing && (
            <Button variant="outline" onClick={startEditing} leftIcon={<Pencil size={16} aria-hidden="true" />}>
              Edit Profile
            </Button>
          )}
        </div>
      </BusinessCard>

      {editing ? (
        <BusinessCard title="Edit business profile" subtitle="Your email address cannot be changed here.">
          {formError && <Alert type="error">{formError}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="bp-grid">
              <FormField
                id="organizationName"
                label="Business name"
                icon={Building2}
                required
                className="bp-grid__full"
                value={values.organizationName}
                onChange={handleChange}
                error={errors.organizationName}
              />
              <FormField
                id="name"
                label="Owner name"
                icon={User}
                required
                value={values.name}
                onChange={handleChange}
                error={errors.name}
              />
              <FormField
                id="businessType"
                as="select"
                label="Business type"
                icon={Briefcase}
                required
                value={values.businessType}
                onChange={handleChange}
                error={errors.businessType}
              >
                <option value="">Select a business type</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FormField>
              <FormField
                id="phone"
                label="Phone number"
                type="tel"
                icon={Phone}
                required
                className="bp-grid__full"
                value={values.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <FormField
                id="address"
                as="textarea"
                rows={2}
                label="Business address"
                icon={MapPin}
                required
                className="bp-grid__full"
                value={values.address}
                onChange={handleChange}
                error={errors.address}
              />
              <FormField
                id="city"
                label="City"
                required
                value={values.city}
                onChange={handleChange}
                error={errors.city}
              />
              <FormField
                id="state"
                label="State"
                required
                value={values.state}
                onChange={handleChange}
                error={errors.state}
              />
            </div>

            <ImageUpload
              file={imageFile}
              onSelect={handleImageSelect}
              onRemove={() => setImageFile(null)}
              error={errors.profileImage}
            />
            <p className="form-hint bp-note">Choosing a new image replaces your current one.</p>

            <div className="bp-actions">
              <Button type="submit" loading={saving} leftIcon={<Save size={16} aria-hidden="true" />}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="ghost" onClick={cancelEditing} disabled={saving} leftIcon={<X size={16} aria-hidden="true" />}>
                Cancel
              </Button>
            </div>
          </form>
        </BusinessCard>
      ) : (
        <BusinessCard title="Business details">
          <dl className="bp-details">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bp-details__item">
                <span className="bp-details__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <dt>{label}</dt>
                  <dd>{value || '-'}</dd>
                </div>
              </div>
            ))}
          </dl>
        </BusinessCard>
      )}
    </div>
  );
}

export default BusinessProfile;