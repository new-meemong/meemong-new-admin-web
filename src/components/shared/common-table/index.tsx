import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  Row,
  SortingState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

export interface CommonTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onClickRow?: (row: Row<T>) => void;
}

function getGridTemplate<T>(columns: ColumnDef<T>[]) {
  return columns
    .map((col) => {
      const size = col.size;
      return size ? `${size}px` : "1fr";
    })
    .join(" ");
}

export default function CommonTable<T>({
  data,
  columns,
  onClickRow,
}: CommonTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const columnTemplate = getGridTemplate<T>(columns);

  return (
    <div className="w-full border rounded-10 overflow-hidden bg-table-background text-table-foreground typo-body-2-long-regular">
      {/* Header */}
      {table.getHeaderGroups().map((headerGroup) => (
        <div
          key={headerGroup.id}
          className="grid border-b bg-table-header-background typo-body-2-long-medium text-table-header-foreground"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          {headerGroup.headers.map((header) => (
            <div
              key={header.id}
              onClick={header.column.getToggleSortingHandler()}
              className={cn(
                "px-3 py-2 truncate text-center",
                header.column.getCanSort() && "cursor-pointer",
              )}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {{
                asc: " ↑",
                desc: " ↓",
              }[header.column.getIsSorted() as string] ?? null}
            </div>
          ))}
        </div>
      ))}
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.id}
          className="grid border-b last:border-b-0 hover:bg-background-label"
          style={{ gridTemplateColumns: columnTemplate }}
          onClick={() => onClickRow?.(row)}
        >
          {row.getVisibleCells().map((cell) => (
            <div
              key={cell.id}
              className="flex items-center justify-center px-3 py-2 truncate text-center"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ))}
        </div>
      ))}
      {!table.getRowModel().rows.length && (
        <div className="text-center p-4 text-gray-500">데이터가 없습니다.</div>
      )}
    </div>
  );
}
