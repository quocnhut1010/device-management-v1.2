type PaginationProps = {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, totalItems, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  return (
    <div className="pagination">
      <button className="button button-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Prev
      </button>
      <span>
        Page {page} / {totalPages} - Total {totalItems}
      </span>
      <button className="button button-secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  )
}
