import { useState, useCallback, useMemo } from 'react'
import { Pageable } from '@/lib/types'

interface UsePaginationOptions {
  initialPage?: number
  initialSize?: number
  initialSort?: string
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 0, initialSize = 10, initialSort = '' } = options
  
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)
  const [sort, setSort] = useState(initialSort)

  const pageable: Pageable = useMemo(() => ({
    page,
    size,
    sort: sort || undefined
  }), [page, size, sort])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize)
    setPage(0) // Reset to first page when changing size
  }, [])

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort)
    setPage(0) // Reset to first page when changing sort
  }, [])

  const resetPagination = useCallback(() => {
    setPage(initialPage)
    setSize(initialSize)
    setSort(initialSort)
  }, [initialPage, initialSize, initialSort])

  return {
    page,
    size,
    sort,
    pageable,
    handlePageChange,
    handleSizeChange,
    handleSortChange,
    resetPagination
  }
} 