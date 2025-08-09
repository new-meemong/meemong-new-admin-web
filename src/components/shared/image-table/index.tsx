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

export interface ImageTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onClickRow?: (row: Row<T>) => void;
  renderItem?: (row: Row<T>) => React.ReactNode;
  gap?: number; // px
}

export default function ImageTable<T>({
  data,
  columns,
  onClickRow,
  renderItem,
  gap = 12, // 기본 12px
}: ImageTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const rows = table.getRowModel().rows;

  return (
    <div className="w-full">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap,
        }}
      >
        {rows.map((row) => (
          <div
            key={row.id}
            role="button"
            tabIndex={0}
            onClick={() => onClickRow?.(row)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onClickRow?.(row);
            }}
            className={cn(
              "group relative overflow-hidden border bg-card text-card-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
            )}
          >
            {renderItem
              ? renderItem(row)
              : flexRender(
                  row.getVisibleCells()[0]?.column.columnDef.cell,
                  row.getVisibleCells()[0]?.getContext(),
                )}
          </div>
        ))}
      </div>
      {!rows.length && (
        <div className="text-center p-4 text-muted-foreground">
          데이터가 없습니다.
        </div>
      )}
    </div>
  );
}
