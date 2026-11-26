import { useNavigate } from 'react-router-dom';

import PageHeading from '../../components/business/PageHeading.jsx';
import ProductForm from '../../components/products/ProductForm.jsx';
import { useToast } from '../../hooks/useToast.js';
import { createProduct } from '../../services/productService.js';
import './AddProduct.css';

function AddProduct() {
  const navigate = useNavigate();
  const toast = useToast();

  // ProductForm shows any error thrown here, so we only handle the success case
  const handleSubmit = async (formData) => {
    const data = await createProduct(formData);
    toast.success(data.message);
    navigate(`/business/products/${data.product.id}`);
  };

  return (
    <div className="add-product">
      <PageHeading
        backTo="/business/products"
        backLabel="My products"
        title="Add Surplus Product"
        subtitle="Share your available surplus products and help reduce unnecessary waste."
      />
      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        submitLabel="Publish Listing"
        cancelTo="/business/products"
      />
    </div>
  );
}

export default AddProduct;