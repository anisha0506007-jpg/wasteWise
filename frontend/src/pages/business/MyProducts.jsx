import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, PackagePlus, SearchX, TriangleAlert } from 'lucide-react';

import BusinessCard from '../../components/business/BusinessCard.jsx';
import PageHeading from '../../components/business/PageHeading.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import DeleteConfirmation from '../../components/products/DeleteConfirmation.jsx';
import ProductCard from '../../components/products/ProductCard.jsx';
import ProductFilters from '../../components/products/ProductFilters.jsx';
import ProductTable from '../../components/products/ProductTable.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { deleteProduct, getMyProducts } from '../../services/productService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { PAGE_SIZE } from '../../utils/productOptions.js';
import './MyProducts.css';

function MyProducts() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState('cards');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    sort: searchParams.get('sort') || 'newest',
  };
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  // Writes changes into the URL ('' removes a value). Changing a filter returns to page 1.
  const updateParams = (changes, { keepPage = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!keepPage) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const handleFilterChange = (changes) =>
    updateParams(changes.sort === 'newest' ? { ...changes, sort: '' } : changes);

  const clearFilters = () => setSearchParams({}, { replace: true });

  const { data, loading, error, reload } = useFetch(
    () => getMyProducts({ ...filters, page, limit: PAGE_SIZE }),
    JSON.stringify([filters, page])
  );

  const products = data?.products || [];
  const pagination = data?.pagination;
  const isFirstLoad = loading && !data;
  const hasFilters = Boolean(filters.search || filters.category || filters.status);

  // If the last item of the last page was removed, step back one page
  useEffect(() => {
    if (data && data.products.length === 0 && page > 1) {
      updateParams({ page: String(Math.max(data.pagination.totalPages, 1)) }, { keepPage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const openDelete = (product) => {
    setDeleteError('');
    setToDelete(product);
  };

  const closeDelete = () => {
    if (!deleting) setToDelete(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteProduct(toDelete.id);
      toast.success(`${toDelete.name} was deleted.`);
      setToDelete(null);
      reload({ silent: true });
    } catch (err) {
      // e.g. "This listing has accepted requests waiting for pickup..."
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  let content;
  if (isFirstLoad) {
    content = (
      <div className="myp__grid" aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="chart" />
        ))}
      </div>
    );
  } else if (error && !data) {
    content = (
      <BusinessCard>
        <EmptyState icon={TriangleAlert} tone="error" title="Could not load your products" text={error}>
          <Button size="sm" variant="outline" onClick={() => reload()}>
            Try again
          </Button>
        </EmptyState>
      </BusinessCard>
    );
  } else if (products.length === 0) {
    content = (
      <BusinessCard>
        {hasFilters ? (
          <EmptyState icon={SearchX} title="No products match your filters" text="Try a different search or clear the filters.">
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </EmptyState>
        ) : (
          <EmptyState icon={Package} title="You haven't listed any products yet" text="Add your first surplus product and NGOs nearby will be able to request it.">
            <Button to="/business/products/new" leftIcon={<PackagePlus size={18} aria-hidden="true" />}>
              Add Surplus Product
            </Button>
          </EmptyState>
        )}
      </BusinessCard>
    );
  } else {
    content = (
      <>
        {view === 'cards' ? (
          <div className="myp__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={openDelete} />
            ))}
          </div>
        ) : (
          <ProductTable products={products} onDelete={openDelete} />
        )}
        <Pagination
          pagination={pagination}
          onChange={(newPage) => {
            updateParams({ page: String(newPage) }, { keepPage: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </>
    );
  }

  return (
    <div className="myp">
      <PageHeading
        title="My Surplus Products"
        subtitle="Manage your surplus listings and track their donation status."
        actions={
          <Button to="/business/products/new" leftIcon={<PackagePlus size={18} aria-hidden="true" />}>
            Add Surplus Product
          </Button>
        }
      />

      <ProductFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={clearFilters}
        view={view}
        onViewChange={setView}
      />

      {pagination && !isFirstLoad && (
        <p className="myp__count" aria-live="polite">
          {pagination.total} product{pagination.total === 1 ? '' : 's'}
          {hasFilters ? ' found' : ''}
        </p>
      )}

      <div className={`myp__content ${loading && data ? 'myp__content--updating' : ''}`}>{content}</div>

      <DeleteConfirmation
        open={Boolean(toDelete)}
        productName={toDelete?.name}
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}

export default MyProducts;