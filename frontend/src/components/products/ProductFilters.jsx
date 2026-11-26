import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, List, Search, X } from 'lucide-react';

import { PRODUCT_CATEGORIES, SORT_OPTIONS, STATUS_OPTIONS } from '../../utils/productOptions.js';
import './ProductFilters.css';

/**
 * Props:
 *  filters      - { search, category, status, sort }
 *  onChange(changes) - e.g. onChange({ category: 'Bakery' })
 *  onClear()    - reset everything
 *  view / onViewChange - 'cards' | 'table'
 */
function ProductFilters({ filters, onChange, onClear, view, onViewChange }) {
  const [searchText, setSearchText] = useState(filters.search);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Keep the box in sync when the search changes from outside (header search, Clear button)
  useEffect(() => {
    setSearchText((current) => (current.trim() === filters.search ? current : filters.search));
  }, [filters.search]);

  // Wait until the owner stops typing before searching
  useEffect(() => {
    if (searchText.trim() === filters.search) return undefined;
    const timer = setTimeout(() => onChangeRef.current({ search: searchText.trim() }), 400);
    return () => clearTimeout(timer);
  }, [searchText, filters.search]);

  const hasFilters = Boolean(
    filters.search || filters.category || filters.status || filters.sort !== 'newest'
  );

  return (
    <div className="pfilters">
      <div className="pfilters__search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by product name..."
          aria-label="Search products"
        />
      </div>

      <select
        value={filters.category}
        onChange={(event) => onChange({ category: event.target.value })}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {PRODUCT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value })}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(event) => onChange({ sort: event.target.value })}
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="pfilters__end">
        {hasFilters && (
          <button type="button" className="pfilters__clear" onClick={onClear}>
            <X size={15} aria-hidden="true" /> Clear
          </button>
        )}
        <div className="pfilters__views" role="group" aria-label="Choose layout">
          <button
            type="button"
            className={view === 'cards' ? 'is-active' : ''}
            onClick={() => onViewChange('cards')}
            aria-pressed={view === 'cards'}
            aria-label="Card view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            className={view === 'table' ? 'is-active' : ''}
            onClick={() => onViewChange('table')}
            aria-pressed={view === 'table'}
            aria-label="Table view"
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductFilters;