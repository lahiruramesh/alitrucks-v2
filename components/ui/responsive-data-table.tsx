"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MoreHorizontal, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  SortAsc,
  SortDesc,
  ChevronsUpDown
} from "lucide-react";

export interface ResponsiveColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  mobileLabel?: string; // Custom label for mobile view
  hideOnMobile?: boolean; // Hide column on mobile
  priority?: 'high' | 'medium' | 'low'; // Display priority for mobile
}

export interface ResponsiveAction<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  show?: (row: T) => boolean;
  icon?: React.ReactNode;
  mobileOnly?: boolean; // Show only on mobile
}

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: ResponsiveColumn<T>[];
  actions?: ResponsiveAction<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  disableSearch?: boolean;
  mobileCardView?: boolean; // Use card view on mobile instead of horizontal scroll
}

export function ResponsiveDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  searchPlaceholder = "Search...",
  emptyMessage = "No data available",
  isLoading = false,
  pagination,
  disableSearch = false,
  mobileCardView = true,
}: ResponsiveDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter data based on search term
  const filteredData = disableSearch ? data : data.filter((row) => {
    if (!searchTerm) return true;
    
    return columns.some((column) => {
      if (!column.searchable) return false;
      
      const value = getNestedValue(row, column.key as string);
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = getNestedValue(a, sortColumn);
    const bValue = getNestedValue(b, sortColumn);
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const renderCellValue = (column: ResponsiveColumn<T>, row: T) => {
    const value = getNestedValue(row, column.key as string);
    
    if (column.render) {
      return column.render(value, row);
    }
    
    // Default rendering for common types
    if (typeof value === "boolean") {
      return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>;
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (typeof value === "number" && column.key.toString().includes("price")) {
      return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: 'SEK',
      }).format(value);
    }
    
    return String(value || "");
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  const visibleColumns = columns.filter(col => !col.hideOnMobile);
  const highPriorityColumns = columns.filter(col => col.priority === 'high');
  const mediumPriorityColumns = columns.filter(col => col.priority === 'medium');

  // Mobile Card View Component
  const MobileCardView = () => (
    <div className="block md:hidden space-y-4">
      {isLoading ? (
        <div className="border-0 bg-card rounded-lg p-6 text-center shadow-sm">
          <div className="animate-pulse">Loading...</div>
        </div>
      ) : sortedData.length === 0 ? (
        <div className="border-0 bg-card rounded-lg p-6 text-center text-muted-foreground shadow-sm">
          {emptyMessage}
        </div>
      ) : (
        sortedData.map((row, index) => (
          <div key={index} className="border-0 bg-card rounded-lg p-4 space-y-3 shadow-sm">
            {/* High priority fields always shown */}
            {highPriorityColumns.map((column) => (
              <div key={column.key as string} className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {column.mobileLabel || column.header}
                </div>
                <div className="font-medium text-foreground">
                  {renderCellValue(column, row)}
                </div>
              </div>
            ))}
            
            {/* Medium priority fields shown with smaller text */}
            {mediumPriorityColumns.map((column) => (
              <div key={column.key as string} className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {column.mobileLabel || column.header}
                </div>
                <div className="text-sm text-muted-foreground">
                  {renderCellValue(column, row)}
                </div>
              </div>
            ))}

            {/* Actions */}
            {actions.length > 0 && (
              <div className="pt-3 border-t border-border/50 space-y-2">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  {actions
                    .filter((action) => !action.show || action.show(row))
                    .map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant === "destructive" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => action.onClick(row)}
                        className="w-full text-xs px-2 py-1.5 h-auto min-h-[32px] flex items-center justify-center gap-1.5 break-words whitespace-normal text-center"
                      >
                        {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                        <span className="truncate">{action.label}</span>
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  // Desktop Table View Component
  const DesktopTableView = () => (
    <div className="hidden md:block">
      <div className="rounded-md border table-responsive">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.key as string}
                  className={`table-cell-responsive ${
                    column.sortable ? "cursor-pointer hover:bg-muted/50 select-none" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key as string)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.key as string)}
                  </div>
                </TableHead>
              ))}
              {actions.filter(a => !a.mobileOnly).length > 0 && (
                <TableHead className="w-[100px] table-cell-responsive">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0)} 
                  className="h-24 text-center table-cell-responsive"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0)} 
                  className="h-24 text-center table-cell-responsive text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                  {visibleColumns.map((column) => (
                    <TableCell key={column.key as string} className="table-cell-responsive max-w-[200px]">
                      <div className="break-words whitespace-normal overflow-hidden">
                        {renderCellValue(column, row)}
                      </div>
                    </TableCell>
                  ))}
                  {actions.filter(a => !a.mobileOnly).length > 0 && (
                    <TableCell className="table-cell-responsive">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {actions
                            .filter((action) => (!action.show || action.show(row)) && !action.mobileOnly)
                            .map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={`${action.variant === "destructive" ? "text-destructive" : ""} whitespace-normal break-words min-h-[36px] py-2`}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                                  <span className="break-words">{action.label}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      {!disableSearch && searchPlaceholder && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Responsive Table Views */}
      {mobileCardView ? <MobileCardView /> : null}
      <DesktopTableView />

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground break-words">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="flex items-center min-w-[80px] h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Previous</span>
              <span className="xs:hidden">Prev</span>
            </Button>
            <div className="text-sm px-3 py-1.5 bg-muted rounded whitespace-nowrap min-w-[100px] text-center">
              <span className="hidden sm:inline">Page </span>
              {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="flex items-center min-w-[80px] h-9"
            >
              <span className="hidden xs:inline truncate">Next</span>
              <span className="xs:hidden">Next</span>
              <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}