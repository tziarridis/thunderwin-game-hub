
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableColumn<TData> {
  header: string;
  accessorKey?: string;
  cell?: (row: TData) => React.ReactNode;
  id?: string;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumn<TData>[];
}

export function DataTable<TData>({ data, columns }: DataTableProps<TData>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={column.accessorKey || column.id || index}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => (
              <TableCell key={`${rowIndex}-${column.accessorKey || column.id || colIndex}`}>
                {column.cell
                  ? column.cell(row)
                  : column.accessorKey
                  ? (row as any)[column.accessorKey]
                  : ''}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
