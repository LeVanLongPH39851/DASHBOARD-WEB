import React, { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import NameChart from '../layouts/components/NameChart';
import iconSearch from '../../assets/icon_search.png'
import iconShowList from '../../assets/icon_show_list.png'
import iconArrowDown from '../../assets/icon_arrow_down.png'
import iconArrowLeftGray from '../../assets/icon_arrow_left_gray.png'
import iconArrowRightGray from '../../assets/icon_arrow_right_gray.png'
import { formatNumber } from '../../utils/formatNumber';
import Loading from '../commons/Loading';









const TableChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  enableHeatmap = true,
  showSTT,
  showPagination,
  displayName=true
}) => {
  const { labels = [], series = [] } = data;

  if(data==='isLoading') {
    return (
      <div className={`${displayName ? 'p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component' : '' }`} style={{ fontFamily }}>
        <NameChart nameChart={nameChart} description={description} display={displayName} />
        <div className='h-16'></div>
        <Loading height={height} />
      </div>
    );
  }





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
          const columnId = info.column.id;
          if (typeof value === 'number' && !isNaN(value)) {
            const isPercent = columnId.includes('%');
            return formatNumber(value, { isPercent });
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




  // ❌ Xóa dòng này
  // const showPagination = tableData.length > 11;


// Tách theo dấu phẩy → OR matching trên tất cả columns
const multiValueGlobalFilter = (row, columnId, filterValue) => {
  const terms = filterValue
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean); // bỏ string rỗng

  if (terms.length === 0) return true;

  const cellValue = String(row.getValue(columnId) ?? '').toLowerCase();

  // Row passed nếu cell này khớp BẤT KỲ term nào
  return terms.some((term) => cellValue.includes(term));
};

// Bắt buộc có để TanStack tự remove filter khi input rỗng
multiValueGlobalFilter.autoRemove = (val) => !val;




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
    globalFilterFn: multiValueGlobalFilter,
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




  const getEChartsData = useCallback(() => {
    return {
      labels: labels,  // ✅ Raw labels từ data gốc
      series: series   // ✅ Raw series từ data gốc (bao gồm filter, sort, pagination states)
    };
  }, [labels, series]);


  return (
    <div className={`${displayName ? 'p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component' : '' }`} style={{ fontFamily }}>
      <NameChart nameChart={nameChart} description={description} display={displayName} getChartData={getEChartsData} table={true} />
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className='flex items-center gap-2'>
          <div className={`relative`}>
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-4 py-1 border border-border-black-10 rounded-xl flex items-center gap-1 transition-all h-10 cursor-pointer"
            >
              <figure><img src={iconShowList} alt="Icon Show List" className='w-3' /></figure>
              <span className='text-sm font-medium text-background-black-90'>Columns</span>
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 top-full mt-2 bg-background-light border border-border-black-10 rounded-lg z-50 min-w-55">
                <div className="p-3 max-h-80 overflow-y-auto">
                  <div className="text-xs font-semibold text-color-black-50 uppercase mb-2 px-2">Toggle Columns</div>
                  {table.getAllLeafColumns().map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md text-xs font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="cursor-pointer w-3 h-3 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-color-black-70">{column.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          {showPagination && (
            <div className='relative cursor-pointer'>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="pl-7 pr-6 py-1 border border-border-black-10 cursor-pointer rounded-xl text-sm appearance-none transition-all flex items-center h-10 outline-none"
              >
                {[10, 20, 50, 100, 200].map((pageSize) => (
                  <option className='text-sm font-medium text-background-black-90' key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <figure className='absolute top-1/2 -translate-y-1/2 left-3'><img src={iconShowList} alt="Icon Show List" className='w-3' /></figure>
              <figure className='absolute top-1/2 -translate-y-1/2 right-3'><img src={iconArrowDown} alt="Icon Arrow Down" className='w-2' /></figure>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 relative">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm"
            className="pl-4 pr-11 py-2.25 border border-border-black-10 rounded-2xl outline-none bg-background-search text-sm font-medium text-color-black-50 placeholder-color-black-50 w-70"
          />
          <figure className='absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer'><img src={iconSearch} alt="Icon Search" className='w-3.75' /></figure>
        </div>
      </div>







      {/* Table Container */}
      <div>
        <div className="overflow-hidden">
          <div
            className="overflow-auto divTable"
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
                className="sticky top-0 z-10"
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => {
                      
                      return (
                        <th
                          key={header.id}
                          className="px-2 py-3 text-center relative text-color-black-50 bg-background-light border-b border-border-black-10"
                          style={{
                            minWidth: `${header.column.getSize() - 40}px`,
                            maxWidth: `${header.column.getSize() + 100}px`,
                            fontSize: fontSize.label,
                            fontWeight: fontWeight.label,
                            whiteSpace: 'pre-line',
                            wordWrap: 'break-word'
                          }}
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() && (
                              <span className="text-color-black-50" style={{ fontSize: '11px' }}>
                                {header.column.getIsSorted() === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-0.5 rounded-2xl cursor-col-resize hover:bg-color-black-50 transition-colors ${
                              header.column.getIsResizing() ? 'bg-color-black-70' : 'bg-transparent'
                            }`}
                            style={{ userSelect: 'none', touchAction: 'none' }}
                          />
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              
              <tbody>
                {table.getRowModel().rows.map((row, idx) => {
                  
                  return (
                    <tr
                      key={row.id}
                      className="odd:bg-background-black-4"
                    >
                      {row.getVisibleCells().map((cell, cellIdx) => {
                        const columnName = cell.column.id;
                        const rawValue = cell.row.original[columnName];
                        const bgColor = columnName === 'STT' ? 'transparent' : getHeatmapColor(rawValue, columnName);
                        const isNumericColumn = typeof rawValue === 'number';
                        
                        return (
                          <td
                            key={cell.id}
                            className={`border-b border-border-black-10 px-2 py-3 text-color-black-100 ${
                              isNumericColumn 
                                ? 'overflow-hidden text-ellipsis whitespace-nowrap' 
                                : 'whitespace-normal'
                            }`}
                            style={{
                              fontSize: fontSize.td,
                              fontWeight: columnName === 'STT' ? 700 : fontWeight.td,
                              minWidth: `${cell.column.getSize() - 40}px`,
                              maxWidth: `${cell.column.getSize() + 100}px`,
                              // backgroundColor: bgColor,
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







      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex items-center justify-end mt-4 gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="w-7.5 h-7.5 flex justify-center items-center disabled:cursor-not-allowed cursor-pointer"
          >
          <figure><img src={iconArrowLeftGray} alt="Icon Arrow Left Gray" className='w-1.25' /></figure>
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
                className={`w-7.5 h-7.5 flex justify-center items-center rounded-lg font-medium transition-all cursor-pointer text-sm ${
                  pageIndex === pageNum
                    ? 'bg-background-black-90 text-background-light shadow-md'
                    : 'text-color-black-50'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}







          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="w-7.5 h-7.5 flex justify-center items-center disabled:cursor-not-allowed cursor-pointer"
          >
          <figure><img src={iconArrowRightGray} alt="Icon Arrow Left Gray" className='w-1.25' /></figure>
          </button>
        </div>
      )}
    </div>
  );
};







export default React.memo(TableChart);
