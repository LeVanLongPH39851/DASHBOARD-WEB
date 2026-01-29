import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import Label from '../layouts/components/NameChart';









const TableChart = ({
  data,
  height = '600px',
  fontSize = {
    label: 16,
    td: 15
  },
  fontFamily,
  fontWeight = {
    label: 600,
    td: 500
  },
  nameChart = 'Chỉ số đo lường chi tiết từng chương trình',
  description = 'Chỉ số đo lường chi tiết từng chương trình',
  enableHeatmap = true,
  showSTT = false
}) => {
  const { labels = [], series = [] } = data;






  const tableData = useMemo(() => {
    return labels.map((label, index) => {
      const row = showSTT ? { 'STT': index + 1 } : {};
      series.forEach(s => {
        row[s.name] = s.data[index];
      });
      return row;
    });
  }, [labels, series, showSTT]);






  const columnStats = useMemo(() => {
    const stats = {};
    
    series.forEach(s => {
      const numericValues = s.data.filter(val => typeof val === 'number');
      if (numericValues.length > 0) {
        stats[s.name] = {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues)
        };
      }
    });
    
    return stats;
  }, [series]);






  const getHeatmapColor = (value, columnName) => {
    if (!enableHeatmap || typeof value !== 'number' || !columnStats[columnName]) {
      return 'transparent';
    }






    const { min, max } = columnStats[columnName];
    
    if (max === min) {
      return 'rgba(34, 197, 94, 0.2)';
    }






    const normalized = (value - min) / (max - min);
    const opacity = 0.1 + (normalized * 0.5);
    
    return `rgba(34, 197, 94, ${opacity})`;
  };






  const columns = useMemo(() => {
    const cols = [];

    if (showSTT) {
      cols.push({
        accessorKey: 'STT',
        header: 'STT',
        cell: (info) => info.getValue(),
        size: 60,
        minSize: 30,
        maxSize: 500,
        enableSorting: false,
      });
    }






    series.forEach(s => {
      cols.push({
        accessorKey: s.name,
        header: s.name,
        cell: (info) => {
          const value = info.getValue();
          if (typeof value === 'number') {
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
          }
          return value || '';
        },
        size: s.name.length > 20 ? 50 : 50,
        minSize: 50,
        maxSize: 1000,
      });
    });






    return cols;
  }, [series, showSTT]);






  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 200,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);



  // Check if total records > 11 for showing pagination
  const showPagination = tableData.length > 11;






  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });






  return (
    <div className="bg-background-light rounded-xl" style={{ fontFamily }}>
      <Label nameChart={nameChart} description={description} />






      {/* Search & Controls - Always show Search and Columns, conditionally show pagination controls */}
      <div className="flex justify-between items-center mb-4 px-6 gap-4">
        <div className="flex items-center gap-3">
          {showPagination && (
            <>
              <span style={{ fontSize: fontSize.label, fontWeight: fontWeight.label, color: '#4b5563' }}>Show</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                style={{ fontSize: fontSize.label }}
              >
                {[10, 20, 50, 100, 200].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: fontSize.label, fontWeight: fontWeight.label, color: '#4b5563' }}>entries</span>
            </>
          )}






          <div className={`relative ${showPagination ? 'ml-2' : ''}`}>
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
              style={{ fontSize: fontSize.label }}
            >
              <span>☰</span>
              <span>Columns</span>
            </button>
            
            {showColumnMenu && (
              <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[220px]">
                <div className="p-3 max-h-[320px] overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Toggle Columns</div>
                  {table.getAllLeafColumns().map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                      style={{ fontSize: fontSize.label }}
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="cursor-pointer w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{column.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>






        <div className="flex items-center gap-3">
          <span style={{ fontSize: fontSize.label, fontWeight: fontWeight.label, color: '#4b5563' }}>Search</span>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Type to search..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            style={{ fontSize: fontSize.label, width: '220px' }}
          />
        </div>
      </div>






      {/* Table Container */}
      <div className="px-6 pb-2">
        <div className="shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div 
            className="overflow-auto"
            style={{ height: height }}
            onClick={() => setShowColumnMenu(false)}
          >
            <table 
              className="w-full" 
              style={{ 
                tableLayout: 'auto',
                borderCollapse: 'separate',
                borderSpacing: 0
              }}
            >
              <thead 
                className="sticky top-0 z-10 shadow-sm"
                style={{ position: 'sticky', top: 0 }}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === headerGroup.headers.length - 1;
                      
                      return (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-center relative bg-gradient-to-b from-teal-50 to-teal-100 border-b-2 border-teal-200"
                          style={{
                            fontSize: fontSize.label,
                            fontWeight: 700,
                            minWidth: `${header.getSize()}px`,
                            color: '#0f766e',
                            borderTopLeftRadius: isFirst ? '8px' : '0',
                            borderTopRightRadius: isLast ? '8px' : '0',
                            whiteSpace: 'pre-line',
                            wordWrap: 'break-word'
                          }}
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              header.column.getCanSort() ? 'cursor-pointer select-none hover:text-teal-700' : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() && (
                              <span className="text-teal-600" style={{ fontSize: '11px' }}>
                                {header.column.getIsSorted() === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </div>






                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-teal-400 transition-colors ${
                              header.column.getIsResizing() ? 'bg-teal-500' : 'bg-transparent'
                            }`}
                            style={{ userSelect: 'none', touchAction: 'none' }}
                          />
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>






              <tbody className="bg-white">
                {table.getRowModel().rows.map((row, idx) => {
                  const isLastRow = idx === table.getRowModel().rows.length - 1;
                  
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      {row.getVisibleCells().map((cell, cellIdx) => {
                        const columnName = cell.column.id;
                        const rawValue = cell.row.original[columnName];
                        const bgColor = columnName === 'STT' ? 'transparent' : getHeatmapColor(rawValue, columnName);
                        const isFirst = cellIdx === 0;
                        const isLast = cellIdx === row.getVisibleCells().length - 1;
                        const isNumericColumn = typeof rawValue === 'number';
                        
                        return (
                          <td
                            key={cell.id}
                            className={`px-4 py-3 ${
                              isNumericColumn 
                                ? 'overflow-hidden text-ellipsis whitespace-nowrap' 
                                : 'whitespace-normal'
                            } ${
                              columnName === 'STT' ? 'font-bold text-gray-700' : 'text-gray-800'
                            }`}
                            style={{
                              fontSize: fontSize.td,
                              fontWeight: columnName === 'STT' ? 700 : fontWeight.td,
                              fontFamily: isNumericColumn ? 'Calibri, Arial, sans-serif' : fontFamily,
                              minWidth: `${cell.column.getSize()}px`,
                              backgroundColor: bgColor,
                              borderBottom: isLastRow ? 'none' : '1px solid #f3f4f6',
                              borderBottomLeftRadius: isLastRow && isFirst ? '8px' : '0',
                              borderBottomRightRadius: isLastRow && isLast ? '8px' : '0',
                              wordWrap: isNumericColumn ? 'normal' : 'break-word'
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>






      {/* Pagination Controls - Only show if records > 11 */}
      {showPagination && (
        <div className="flex items-center justify-center mt-4 pb-4 gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm font-medium"
            style={{ fontSize: fontSize.label }}
          >
            ← Previous
          </button>
          
          {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
            const pageIndex = table.getState().pagination.pageIndex;
            let pageNum;
            
            if (table.getPageCount() <= 5) {
              pageNum = i;
            } else if (pageIndex < 3) {
              pageNum = i;
            } else if (pageIndex > table.getPageCount() - 4) {
              pageNum = table.getPageCount() - 5 + i;
            } else {
              pageNum = pageIndex - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => table.setPageIndex(pageNum)}
                className={`px-4 py-2 border rounded-lg font-medium transition-all shadow-sm ${
                  pageIndex === pageNum
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
                style={{ fontSize: fontSize.label }}
              >
                {pageNum + 1}
              </button>
            );
          })}






          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm font-medium"
            style={{ fontSize: fontSize.label }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};






export default React.memo(TableChart);
