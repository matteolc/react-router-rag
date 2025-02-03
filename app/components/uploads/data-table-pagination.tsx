import type { Table } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { generateQueryParams } from '~/lib/table'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalRows: number
  page: number
  perPage: number
}

export function DataTablePagination<TData>({ 
  table,
  totalRows,
  page,
  perPage
}: DataTablePaginationProps<TData>) {
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, totalRows)

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {start}-{end} of {totalRows}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            asChild
            disabled={page === 1}
          >
            <Link
              to={`?${generateQueryParams({
                page: page - 1,
                sort: table.getState().sorting[0]?.id,
                order: table.getState().sorting[0]?.desc ? 'desc' : 'asc',
                filters: table.getState().columnFilters,
              })}`}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            asChild
            disabled={page * perPage >= totalRows}
          >
            <Link
              to={`?${generateQueryParams({
                page: page + 1,
                sort: table.getState().sorting[0]?.id,
                order: table.getState().sorting[0]?.desc ? 'desc' : 'asc',
                filters: table.getState().columnFilters,
              })}`}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 