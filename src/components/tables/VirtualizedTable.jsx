import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * High-performance virtualized table component for large datasets
 * @param {Object} props
 * @param {Array} props.data - Table data array
 * @param {Array} props.columns - Column configuration array
 * @param {number} props.rowHeight - Height of each row in pixels
 * @param {number} props.containerHeight - Container height in pixels
 * @param {boolean} props.selectable - Enable row selection
 * @param {Function} props.onSelectionChange - Selection change handler
 * @param {Function} props.onRowClick - Row click handler
 * @param {Function} props.onSort - Sort handler
 * @param {string} props.className - Additional CSS classes
 */
export const VirtualizedTable = ({
  data = [],
  columns = [],
  rowHeight = 50,
  containerHeight = 400,
  selectable = false,
  onSelectionChange,
  onRowClick,
  onSort,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const visibleCount = Math.ceil(containerHeight / rowHeight);
    const endIndex = Math.min(startIndex + visibleCount + 2, data.length); // Add buffer

    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, rowHeight, containerHeight, data.length]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((rowIndex, isSelected) => {
    const newSelected = new Set(selectedRows);

    if (isSelected) {
      newSelected.add(rowIndex);
    } else {
      newSelected.delete(rowIndex);
    }

    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected).map(index => data[index]));
  }, [selectedRows, data, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      const allIndices = new Set(data.map((_, index) => index));
      setSelectedRows(allIndices);
      onSelectionChange?.(data);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  }, [data, onSelectionChange]);

  // Handle sort
  const handleSort = useCallback((columnKey) => {
    const direction = sortConfig.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key: columnKey, direction });

    if (onSort) {
      onSort(columnKey, direction);
    }
  }, [sortConfig, onSort]);

  // Render table header
  const renderHeader = () => (
    <div className="flex border-b bg-muted/50 sticky top-0 z-10">
      {selectable && (
        <div className="w-12 p-3 border-r flex items-center justify-center">
          <Checkbox
            checked={selectedRows.size === data.length && data.length > 0}
            onCheckedChange={handleSelectAll}
          />
        </div>
      )}

      {columns.map(column => (
        <div
          key={column.key}
          className="flex-1 p-3 border-r last:border-r-0 cursor-pointer hover:bg-muted/70 flex items-center justify-between"
          onClick={() => column.sortable !== false && handleSort(column.key)}
        >
          <span className="font-medium">{column.title}</span>
          {column.sortable !== false && sortConfig.key === column.key && (
            <span className="text-muted-foreground">
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  // Render table row
  const renderRow = (rowData, rowIndex) => {
    const isSelected = selectedRows.has(rowIndex);

    return (
      <div
        key={rowIndex}
        className={`flex border-b hover:bg-muted/50 cursor-pointer ${
          isSelected ? 'bg-primary/5' : ''
        }`}
        style={{ height: rowHeight }}
        onClick={() => onRowClick?.(rowData, rowIndex)}
      >
        {selectable && (
          <div className="w-12 p-3 border-r flex items-center justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleRowSelect(rowIndex, checked)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {columns.map(column => {
          const cellValue = rowData[column.key];
          const cellContent = column.render ? column.render(cellValue, rowData, rowIndex) : cellValue;

          return (
            <div
              key={column.key}
              className="flex-1 p-3 border-r last:border-r-0 flex items-center overflow-hidden"
            >
              {column.type === 'badge' ? (
                <Badge variant={cellValue === 'active' ? 'default' : 'secondary'}>
                  {cellContent}
                </Badge>
              ) : column.type === 'boolean' ? (
                <div className={`w-4 h-4 rounded-full ${cellValue ? 'bg-green-500' : 'bg-gray-300'}`} />
              ) : (
                <span className="truncate">{cellContent}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate total height for scroll container
  const totalHeight = data.length * rowHeight;
  const offsetY = visibleRange.startIndex * rowHeight;

  return (
    <Card className={`virtualized-table ${className}`} {...props}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Tabela Virtualizada</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{data.length} itens</span>
            {selectedRows.size > 0 && (
              <Badge variant="outline">{selectedRows.size} selecionados</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          {/* Fixed header */}
          {renderHeader()}

          {/* Scrollable content */}
          <div
            className="overflow-auto"
            style={{ height: containerHeight }}
            onScroll={handleScroll}
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {/* Rendered rows */}
              {Array.from({ length: visibleRange.endIndex - visibleRange.startIndex }).map((_, index) => {
                const dataIndex = visibleRange.startIndex + index;
                if (dataIndex >= data.length) return null;

                return (
                  <div
                    key={dataIndex}
                    style={{
                      position: 'absolute',
                      top: offsetY + (index * rowHeight),
                      width: '100%',
                    }}
                  >
                    {renderRow(data[dataIndex], dataIndex)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualizedTable;
