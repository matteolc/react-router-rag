import type { ColumnDef, Row, Table, CellContext } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type { Tables } from "~/db.types";
import { Badge } from "~/components/ui/badge";
import { humanReadableFileSize, humanReadableMIMEType } from "~/lib/file";
import { Link } from "react-router";

export const typeFilters = [
  { label: "PDF", value: "application/pdf" },
  { label: "Text", value: "text/plain" },
  { label: "Image", value: "image/png" },
  { label: "Audio", value: "audio/mpeg" },
  { label: "Video", value: "video/mp4" },
];

export const columns: ColumnDef<Tables<"uploads">>[] = [
  {
    id: "select",
    size: 40,
    minSize: 40,
    maxSize: 40,
    header: ({ table }) => (
      <div className="w-[40px] flex justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }: { row: Row<Tables<"uploads">> }) => (
      <div className="w-[40px] flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
          }}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    size: 450,
    header: ({ column }) => (
      <div className="w-[450px]">
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[430px]">
        <Link to={`/uploads/${row.original.id}`} prefetch="intent">
          {row.getValue("name")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "size",
    size: 160,
    header: ({ column }) => (
      <div className="w-[160px] flex justify-end">
        <DataTableColumnHeader column={column} title="Size" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="truncate max-w-[160px] flex justify-end">
        {humanReadableFileSize(row.getValue("size"))}
      </div>
    ),
  },
  {
    accessorKey: "type",
    size: 100,
    header: ({ column }) => (
      <div className="w-[100px] flex justify-end">
        <DataTableColumnHeader column={column} title="Type" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="truncate max-w-[100px] flex justify-end">
        <Badge variant="outline" className="text-xs">
          {humanReadableMIMEType(row.getValue("type"))}
        </Badge>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    size: 100,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DataTableRowActions row={row} />
      </div>
    ),
  },
];
