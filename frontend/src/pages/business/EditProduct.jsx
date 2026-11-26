import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Package, TriangleAlert } from 'lucide-react';

import BusinessCard from '../../components/business/BusinessCard.jsx';
import PageHeading from '../../components/business/PageHeading.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ProductForm from '../../components/products/ProductForm.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { getProduct, updateProduct } from '../../services/productService.js';
import './EditProduct.css';

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data, loading, error, reload } = useFetch(() => getProduct(productId), productId);
  const product = data?.product;
  const detailsPath = `/business/products/${productId}`;

  const handleSubmit = async (formData) => {
    const result = await updateProduct(productId, formData);
    toast.success(result.message);
    navigate(detailsPath);
  };

  let content;
  if (loading && !product) {
    content = (
      <div className="edit-product__skeletons" aria-busy="true">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  } else if (error && !product) {
    content = (
      <BusinessCard>
        <EmptyState icon={TriangleAlert} tone="error" title="Could not load this product" text={error}>
          <Button size="sm" variant="outline" onClick={() => reload()}>
            Try again
          </Button>
          <Button to="/business/products" size="sm" leftIcon={<Package size={16} aria-hidden="true" />}>
            My products
          </Button>
        </EmptyState>
      </BusinessCard>
    );
  } else if (product.status === 'collected') {
    content = (
      <BusinessCard>
        <EmptyState icon={Lock} title="This listing is complete" text="Fully collected listings cannot be edited. They stay in your history.">
          <Button to={detailsPath}>View details</Button>
        </EmptyState>
      </BusinessCard>
    );
  } else {
    content = (
      <ProductForm
        key={product.id}
        mode="edit"
        initialProduct={product}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        cancelTo={detailsPath}
      />
    );
  }

  return (
    <div className="edit-product">
      <PageHeading
        backTo={detailsPath}
        backLabel="Back to details"
        title="Edit Product"
        subtitle="Update your listing. Changes are visible to NGOs and individuals right away."
      />
      {content}
    </div>
  );
}

export default EditProduct;