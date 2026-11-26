import { ChevronLeft, ChevronRight } from 'lucide-react';

import Button from './Button.jsx';
import './Pagination.css';

// pagination = the object returned by the API; onChange(newPage)
function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={!pagination.hasPrevPage}
        onClick={() => onChange(pagination.page - 1)}
        leftIcon={<ChevronLeft size={16} aria-hidden="true" />}
      >
        Previous
      </Button>
      <span className="pagination__info">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!pagination.hasNextPage}
        onClick={() => onChange(pagination.page + 1)}
        rightIcon={<ChevronRight size={16} aria-hidden="true" />}
      >
        Next
      </Button>
    </nav>
  );
}

export default Pagination;