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
import iconSearch from '../../assets/icon_search.png';
import iconSearchDark from '../../assets/icon_search_dark.png';
import iconShowList from '../../assets/icon_show_list.png'
import iconShowListDark from '../../assets/icon_show_list_dark.png'
import iconArrowDown from '../../assets/icon_arrow_down.png'
import iconArrowDownDark from '../../assets/icon_arrow_down_dark.png'
import iconArrowLeftGray from '../../assets/icon_arrow_left_gray.png'
import iconArrowRightGray from '../../assets/icon_arrow_right_gray.png'
import iconArrowLeftGrayDark from '../../assets/icon_arrow_left_gray_dark.png'
import iconArrowRightGrayDark from '../../assets/icon_arrow_right_gray_dark.png'
import { formatNumber } from '../../utils/formatNumber';
import Loading from '../commons/Loading';
import { formatKMB } from '../../utils/formatNumber';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';
import NoData from '../commons/NoData';









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
  displayName=true,
  center=false
}) => {

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  
  if(data==='isLoading') {
    return (
      <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : '' }`} style={{ fontFamily }}>
        <NameChart nameChart={nameChart} description={description} display={displayName} />
        <div className='h-13 max-md:h-9.25'></div>
        <Loading height={!stateGlobals.screen_md ? height : stateGlobals.currentTab == 'program' ? '300px'  : '240px'} />
      </div>
    );
  } else if (!data) {
    return (
      <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : '' }`} style={{ fontFamily }}>
        <NameChart nameChart={nameChart} description={description} display={displayName} />
        <div className='h-13 max-md:h-9.25'></div>
        <NoData height={!stateGlobals.screen_md ? height : stateGlobals.currentTab == 'program' ? '300px'  : '240px'} />
      </div>
    );
  }

  const { labels = [], series = [] } = data;

  showSTT = !stateGlobals.screen_md ? showSTT : false;


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
            const isMinuteUserProgram = columnId.includes('Phút/người/\nlượt phát');
            return  isMinuteUserProgram ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : formatNumber(value, { isPercent });
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
    <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : '' }`} style={{ fontFamily }}>
      <NameChart nameChart={nameChart} description={description} display={displayName} getChartData={getEChartsData} table={true} />
      <div className="flex justify-between items-center mb-3 max-md:mb-1">
        <div className='flex items-center gap-2 max-md:gap-1'>
          <div className={`relative`}>
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-4 max-md:px-2 py-1 border border-border-black-10 dark:border-background-white-15 dark:bg-background-white-8 duration-300 rounded-xl flex items-center gap-1 transition-all h-10 max-md:h-8 cursor-pointer"
            >
              <figure><img src={!stateGlobals.darkMode ? iconShowList : iconShowListDark} alt="Icon Show List" className='w-3 max-md:w-2.5' /></figure>
              <span className='text-sm max-md:text-[10.5px] font-medium text-background-black-90 dark:text-color-white-50 transition-all duration-300'>Chọn cột</span>
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 top-full mt-2 max-md:mt-1 bg-background-light dark:bg-background-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-lg z-50 min-w-55 max-md:min-w-50">
                <div className="p-3 max-md:p-2 max-h-80 max-md:max-h-70 overflow-y-auto">
                  <div className="text-xs max-md:text-[10.5px] font-semibold text-color-black-50 dark:text-color-white-80 transition-all duration-300 uppercase mb-2 px-2 max-md:px-1">Danh sách cột</div>
                  {table.getAllLeafColumns().map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 px-3 max-md:px-2 py-2 max-md:py-1.25 cursor-pointer rounded-md text-xs max-md:text-[10.5px] font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="cursor-pointer w-3 h-3 max-md:w-2.5 max-md:h-2.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-color-black-70 dark:text-color-white-80 transition-all duration-300">{column.id}</span>
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
                className="pl-7 pr-6 py-1 border border-border-black-10 dark:border-background-white-15 text-background-black-90 dark:bg-background-white-8 dark:text-color-white-50 duration-300 cursor-pointer rounded-xl text-sm max-md:text-[10.5px] appearance-none transition-all flex items-center h-10 max-md:h-8 outline-none"
              >
                {[10, 20, 50, 100, 200].map((pageSize) => (
                  <option className='text-sm max-md:text-[10.5px] font-medium text-background-black-90 dark:text-color-white-80 dark:bg-background-dark transition-all duration-300' key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <figure className='absolute top-1/2 -translate-y-1/2 left-3 rotate-90'><img src={!stateGlobals.darkMode ? iconShowList : iconShowListDark} alt="Icon Show List" className='w-3 max-md:w-2.5' /></figure>
              <figure className='absolute top-1/2 -translate-y-1/2 right-3'><img src={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} alt="Icon Arrow Down" className='w-2 max-md:w-1.75' /></figure>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 relative">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm"
            className="pl-4 pr-11 max-md:pr-10 py-2.25 max-md:py-2 border border-border-black-10 dark:border-background-white-15 rounded-2xl outline-none bg-background-search dark:bg-background-white-8 transition-all duration-300 text-sm max-md:text-[10.5px] font-medium text-color-black-50 placeholder-color-black-50 dark:text-color-white-50 dark:placeholder-color-white-50 w-70 max-md:w-35"
          />
          <figure className='absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer'><img src={!stateGlobals.darkMode ? iconSearch : iconSearchDark} alt="Icon Search" className='w-3.75 max-md:w-3' /></figure>
        </div>
      </div>







      {/* Table Container */}
      <div>
        <div className="overflow-hidden">
          <div
            className="overflow-auto divTable"
            style={{ height: !stateGlobals.screen_md ? height : stateGlobals.currentTab == 'program' ? '300px'  : '240px' }}
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
                          className={`px-2 max-md:px-1 py-3 max-md:py-2 text-center relative text-color-neotam dark:text-background-primary bg-background-light dark:bg-background-chart-dark border-b border-border-black-10 dark:border-background-white-15 transition-all duration-300 ${header.id === 'CHƯƠNG TRÌNH' ? 'max-md:sticky max-md:left-0 max-md:z-10' : ''}`}
                          style={{
                            minWidth: `${stateGlobals.screen_md ? header.id === 'MÔ TẢ' ? header.column.getSize() + 50 : header.id === 'KÊNH' ? header.column.getSize() + 0 : header.id === 'CHƯƠNG TRÌNH' ? header.column.getSize() + 70 : header.id.includes('\n') ? header.column.getSize() + 20 : header.column.getSize() + 30 : header.column.getSize() - 40}px`,
                            maxWidth: `${header.id === 'KÊNH' ? header.column.getSize() + 30 : header.id === 'CHƯƠNG TRÌNH' ? header.column.getSize() + 180 : header.column.getSize() + 100}px`,
                            fontSize: !stateGlobals.screen_md ? fontSize.label : '10.5px',
                            fontWeight: fontWeight.label,
                            whiteSpace: 'pre-line',
                            wordWrap: 'break-word'
                          }}
                        >
                          <div
                            className={`flex items-center gap-2 ${idx === 0 && header.id !== 'STT' ? 'justify-center' : headerGroup.headers.length - idx <= 5 ? 'justify-end' : ''} ${
                              header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() && (
                              <span className="text-color-neotam transition-all duration-300 text-[10px] max-md:text-[8px]">
                                {header.column.getIsSorted() === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-0.5 rounded-2xl cursor-col-resize text-color-neotam dark:text-background-primary transition-colors duration-300 ${
                              header.column.getIsResizing() ? 'text-color-neotam dark:text-background-primary' : 'bg-transparent'
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
                      className="odd:bg-background-black-4 dark:odd:bg-background-white-8 transition-all duration-300"
                    >
                      {row.getVisibleCells().map((cell, cellIdx) => {
                        const columnName = cell.column.id;
                        const rawValue = cell.row.original[columnName];
                        const bgColor = columnName === 'STT' ? 'transparent' : getHeatmapColor(rawValue, columnName);
                        const isNumericColumn = typeof rawValue === 'number';
                        
                        return (
                          <td
                            key={cell.id}
                            className={`border-b ${columnName === 'CHƯƠNG TRÌNH' ? 'max-md:border-r' : ''} border-border-black-10 dark:border-background-white-15 px-2 max-md:px-1 py-3 max-md:py-2 text-color-black-100 dark:text-color-white-90 transition-all duration-300 ${columnName === 'CHƯƠNG TRÌNH' ? `max-md:sticky max-md:left-0 max-md:z-1 max-md:bg-background-light max-md:dark:bg-background-chart-dark max-md:before:content-[''] max-md:before:inset-0 max-md:before:absolute max-md:before:-z-2 ${idx%2===0 ? 'max-md:before:bg-background-black-4 max-md:dark:before:bg-background-white-8' : 'max-md:before:bg-background-light max-md:dark:before:bg-background-chart-dark'}` : ''} ${
                              isNumericColumn 
                                ? `overflow-hidden text-ellipsis whitespace-nowrap ${columnName !== 'STT' ? 'text-right' : ''}`
                                : `whitespace-normal ${center ? 'text-center' : false}`
                            }`}
                            style={{
                              fontSize: !stateGlobals.screen_md ? fontSize.td : '10.5px',
                              fontWeight: ['CHƯƠNG TRÌNH'].includes(columnName) ? 700 : fontWeight.td,
                              minWidth: `${stateGlobals.screen_md ? columnName === 'MÔ TẢ' ? cell.column.getSize() + 50 : columnName === 'KÊNH' ? cell.column.getSize() + 0 : columnName === 'CHƯƠNG TRÌNH' ? cell.column.getSize() + 70 : isNumericColumn ? cell.column.getSize() + 20 : cell.column.getSize() + 30 : cell.column.getSize() - 40}px`,
                              maxWidth: `${columnName === 'KÊNH' ? cell.column.getSize() + 30 : columnName === 'CHƯƠNG TRÌNH' ? cell.column.getSize() + 180 : cell.column.getSize() + 100}px`,
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
            className="w-7.5 max-md:w-7 h-7.5 max-md:h-7 flex justify-center items-center disabled:cursor-not-allowed cursor-pointer dark:border dark:border-background-white-15 dark:rounded-lg transition-all duration-300"
          >
          <figure><img src={!stateGlobals.darkMode ? iconArrowLeftGray : iconArrowLeftGrayDark} alt="Icon Arrow Left Gray" className='w-1.25' /></figure>
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
                className={`w-7.5 max-md:w-7 h-7.5 max-md:h-7 flex justify-center items-center rounded-lg font-medium transition-all dark:border dark:border-background-white-15 cursor-pointer text-sm max-md:text-xs duration-300 ${
                  pageIndex === pageNum
                    ? 'bg-background-black-90 text-background-light dark:bg-background-white-8 shadow-md transition-all duration-300'
                    : 'text-color-black-50 dark:text-color-white-80'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}







          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="w-7.5 max-md:w-7 h-7.5 max-md:h-7 flex justify-center items-center disabled:cursor-not-allowed cursor-pointer dark:border dark:border-background-white-15 dark:rounded-lg transition-all duration-300"
          >
          <figure><img src={!stateGlobals.darkMode ? iconArrowRightGray : iconArrowRightGrayDark} alt="Icon Arrow Left Gray" className='w-1.25' /></figure>
          </button>
        </div>
      )}
    </div>
  );
};







export default React.memo(TableChart);
