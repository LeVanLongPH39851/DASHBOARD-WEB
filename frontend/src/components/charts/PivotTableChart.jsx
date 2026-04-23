import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import NameChart from '../layouts/components/NameChart';
import Loading from '../commons/Loading';
import NoData from '../commons/NoData';
import iconSearch from '../../assets/icon_search.png';
import iconSearchDark from '../../assets/icon_search_dark.png';
import iconShowList from '../../assets/icon_show_list.png';
import iconShowListDark from '../../assets/icon_show_list_dark.png';
import iconArrowDown from '../../assets/icon_arrow_down.png';
import iconArrowDownDark from '../../assets/icon_arrow_down_dark.png';
import iconArrowLeftGray from '../../assets/icon_arrow_left_gray.png';
import iconArrowRightGray from '../../assets/icon_arrow_right_gray.png';
import iconArrowLeftGrayDark from '../../assets/icon_arrow_left_gray_dark.png';
import iconArrowRightGrayDark from '../../assets/icon_arrow_right_gray_dark.png';
import { formatNumber } from '../../utils/formatNumber';
import { LABEL } from '../../utils/label';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';

const aggregateValue = (items, valueField, aggType) => {
  const values = items
    .map((d) => Number(d[valueField]))
    .filter((v) => !Number.isNaN(v));

  if (aggType === 'count') return items.length;
  if (values.length === 0) return null;

  if (aggType === 'sum') return values.reduce((a, b) => a + b, 0);
  if (aggType === 'avg') return values.reduce((a, b) => a + b, 0) / values.length;
  if (aggType === 'min') return Math.min(...values);
  if (aggType === 'max') return Math.max(...values);

  return values.reduce((a, b) => a + b, 0);
};

const buildPivotData = ({ data, rowField, columnField, valueField, aggType, sortColTimeband }) => {
  const rowKeys = [...new Set(data.map((d) => String(d[rowField] ?? '')))];
  let colKeys = [...new Set(data.map((d) => String(d[columnField] ?? '')))];

  if (sortColTimeband) colKeys = [...colKeys].sort((a, b) => ((parseInt(String(a).match(/(\d+)\s*h/i)?.[1] ?? Number.MAX_SAFE_INTEGER, 10)) - (parseInt(String(b).match(/(\d+)\s*h/i)?.[1] ?? Number.MAX_SAFE_INTEGER, 10))) || String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }));

  const grouped = {};
  data.forEach((item) => {
    const r = item[rowField] ?? '';
    const c = item[columnField] ?? '';
    if (!grouped[r]) grouped[r] = {};
    if (!grouped[r][c]) grouped[r][c] = [];
    grouped[r][c].push(item);
  });

  const pivotRows = rowKeys.map((r) => {
    const rowObj = { [rowField]: r };
    colKeys.forEach((c) => {
      rowObj[c] = grouped[r]?.[c]
        ? aggregateValue(grouped[r][c], valueField, aggType)
        : null;
    });
    return rowObj;
  });

  return { pivotRows, colKeys };
};

const PivotTableChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  rowField,
  columnField,
  valueField,
  aggType = 'sum',
  showPagination = false,
  displayName = true,
  enableHeatmap = false,
  suffix='',
  formatterValue=0,
  sortColTimeband=false
}) => {
  const { stateGlobals } = useDashboardStateGlobals();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 200,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const tableScrollRef = useRef(null);

  // ✅ Đặt tất cả logic kiểm tra data trước các hook
  const isLoading = data === 'isLoading';
  const isEmptyData = !data || !Array.isArray(data) || data.length === 0;
  const safeData = isLoading || isEmptyData ? [] : data;

  // ✅ Tất cả hook luôn chạy - không còn conditional hook nữa
  const { pivotRows, colKeys } = useMemo(() => {
    return buildPivotData({ data: safeData, rowField, columnField, valueField, aggType, sortColTimeband });
  }, [safeData, rowField, columnField, valueField, aggType, sortColTimeband]);

  const columnStats = useMemo(() => {
    const stats = {};
    colKeys.forEach((key) => {
      const values = pivotRows.map((r) => r[key]).filter((v) => typeof v === 'number');
      if (values.length) {
        stats[key] = {
          min: Math.min(...values),
          max: Math.max(...values),
        };
      }
    });
    return stats;
  }, [pivotRows, colKeys]);

  const getHeatmapColor = useCallback((value, columnName) => {
    if (!enableHeatmap || typeof value !== 'number' || !columnStats[columnName]) return 'transparent';
    const { min, max } = columnStats[columnName];
    if (max === min) return 'rgba(34, 197, 94, 0.2)';
    const normalized = (value - min) / (max - min);
    const opacity = 0.1 + normalized * 0.5;
    return `rgba(34, 197, 94, ${opacity})`;
  }, [enableHeatmap, columnStats]);

  const columns = useMemo(() => {
    return [
      {
        id: String(rowField),
        accessorKey: rowField,
        header: LABEL[rowField] || rowField,
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      ...colKeys.map((key) => ({
        id: key,
        accessorKey: key,
        header: key,
        cell: (info) => {
          const value = info.getValue();
          if (typeof value === 'number' && !Number.isNaN(value)) {
            return value.toLocaleString(undefined, { maximumFractionDigits: formatterValue });
          }
          return value ?? '';
        },
        enableSorting: true,
      })),
    ];
  }, [rowField, colKeys]);

  const table = useReactTable({
    data: pivotRows,
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

  const getPivotChartData = useCallback(() => {
    return { data: safeData, rowField, columnField, valueField, aggType };
  }, [safeData, rowField, columnField, valueField, aggType]);

  // ✅ Return theo điều kiện sau khi tất cả hook đã chạy xong
  if (isLoading) {
    return (
      <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : ''}`} style={{ fontFamily }}>
        <NameChart nameChart={nameChart} description={description} display={displayName} />
        <div className='h-13 max-lg:h-1 max-md:h-9.25'></div>
        <Loading height={!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : '320px' : '240px'} />
      </div>
    );
  }

  if (isEmptyData) {
    return (
      <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : ''}`} style={{ fontFamily }}>
        <NameChart nameChart={nameChart} description={description} display={displayName} />
        <div className='h-13 max-lg:h-1 max-md:h-9.25'></div>
        <NoData height={!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : '320px' : '240px'} />
      </div>
    );
  }

  // ✅ JSX table view - giữ nguyên 100%
  return (
    <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : ''}`} style={{ fontFamily }}>
      <NameChart nameChart={nameChart} description={description} display={displayName} getChartData={getPivotChartData} table={true} />

      <div className="flex justify-between items-center mb-3 max-lg:mb-2 max-md:mb-1">
        <div className='flex items-center gap-2 max-lg:gap-1.5 max-md:gap-1'>
          <div className={`relative`}>
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-4 max-lg:px-3 max-md:px-2 py-1 border border-border-black-10 dark:border-background-white-15 dark:bg-background-white-8 duration-300 rounded-xl flex items-center gap-1 transition-all h-10 max-lg:h-9 max-md:h-8 cursor-pointer"
            >
              <figure><img src={!stateGlobals.darkMode ? iconShowList : iconShowListDark} alt="Icon Show List" className='w-3 max-lg:w-2.75 max-md:w-2.5' /></figure>
              <span className='text-sm max-lg:text-xs max-md:text-[10.5px] font-normal text-background-black-90 dark:text-color-white-50 transition-all duration-300'>Chọn cột</span>
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 top-full mt-2 max-lg:mt-1.5 max-md:mt-1 bg-background-light dark:bg-background-dark dark:border-background-white-15 transition-all duration-300 border border-border-black-10 rounded-lg z-50 min-w-55 max-md:min-w-50">
                <div className="p-3 max-lg:p-2.5 max-md:p-2 max-h-80 max-lg:max-h-75 max-md:max-h-70 overflow-y-auto">
                  <div className="text-xs max-lg:text-[11px] max-md:text-[10.5px] font-medium text-color-black-50 dark:text-color-white-80 transition-all duration-300 uppercase mb-2 px-2 max-md:px-1">Danh sách cột</div>
                  {table.getAllLeafColumns().map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 max-lg:gap-1.5 px-3 max-lg:px-2.5 max-md:px-2 py-2 max-lg:py-1.75 max-md:py-1.25 cursor-pointer rounded-md text-xs max-lg:text-[11px] text-nowrap max-md:text-[10.5px] font-normal"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="cursor-pointer w-3 max-lg:w-2.75 h-3 max-lg:h-2.75 max-md:w-2.5 max-md:h-2.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-color-black-70 dark:text-color-white-80 transition-all duration-300">{LABEL[column.id] || column.id}</span>
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
                className="pl-7 max-lg:pl-6.75 pr-6 max-lg:pr-5.75 py-1 border border-border-black-10 dark:border-background-white-15 text-background-black-90 dark:bg-background-white-8 dark:text-color-white-50 duration-300 cursor-pointer rounded-xl text-sm max-lg:text-[11px] max-md:text-[10.5px] appearance-none transition-all flex items-center h-10 max-lg:h-9 max-md:h-8 outline-none"
              >
                {[10, 20, 50, 100, 200].map((pageSize) => (
                  <option className='text-sm max-lg:text-[11px] max-md:text-[10.5px] font-normal text-background-black-90 dark:text-color-white-80 dark:bg-background-dark transition-all duration-300' key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <figure className='absolute top-1/2 -translate-y-1/2 left-3 rotate-90'><img src={!stateGlobals.darkMode ? iconShowList : iconShowListDark} alt="Icon Show List" className='w-3 max-lg:w-2.75 max-md:w-2.5' /></figure>
              <figure className='absolute top-1/2 -translate-y-1/2 right-3'><img src={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} alt="Icon Arrow Down" className='w-2 max-lg:w-1.75 max-md:w-1.75' /></figure>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 relative">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm"
            className="pl-4 max-lg:pl-3.75 pr-11 max-lg:pr:10.75 max-md:pr-10 py-2.25 max-lg:py-2.25 max-md:py-2 border border-border-black-10 dark:border-background-white-15 rounded-2xl outline-none bg-background-search dark:bg-background-white-8 transition-all duration-300 text-sm max-lg:text-xs max-md:text-[10.5px] font-normal text-color-black-50 placeholder-color-black-50 dark:text-color-white-50 dark:placeholder-color-white-50 w-70 max-lg:w-60 max-md:w-35"
          />
          <figure className='absolute top-1/2 -translate-y-1/2 right-4 max-lg:right-3.75 cursor-pointer'><img src={!stateGlobals.darkMode ? iconSearch : iconSearchDark} alt="Icon Search" className='w-3.75 max-lg:w-3.5 max-md:w-3' /></figure>
        </div>
      </div>

      <div className='table-container'>
        <div className="overflow-hidden">
          <div
            ref={tableScrollRef}
            className="overflow-auto divTable"
            style={{ height: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : '320px' : '240px' }}
          >
            <table className="w-full" style={{ tableLayout: 'auto', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead className="sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => (
                      <th
                        key={header.id}
                        className={`px-2 max-lg:px-1.5 max-md:px-1 py-3 max-lg:py-2.5 max-md:py-2 text-center relative text-color-neotam dark:text-background-primary bg-background-light dark:bg-background-chart-dark border-b border-r border-border-black-10 dark:border-background-white-15 transition-all duration-300 ${idx === 0 ? 'sticky left-0 z-10' : ''}`}
                        style={{
                          fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.label : '12px' : '10.5px',
                          fontWeight: fontWeight.label,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <div
                          className={`flex items-center gap-2 max-lg:gap-1.5 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() && (
                              <span className="text-color-neotam transition-all duration-300 text-[10px] max-lg:text-[9px] max-md:text-[8px]">
                                {header.column.getIsSorted() === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                        </div>
                        <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-0.5 rounded-2xl cursor-col-resize transition-colors duration-300 ${
                              header.column.getIsResizing() ? 'bg-color-neotam dark:bg-background-primary' : 'bg-transparent'
                            }`}
                            style={{ userSelect: 'none', touchAction: 'none' }}
                          />
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row, idx) => (
                  <tr key={row.id} className="odd:bg-background-black-4 dark:odd:bg-background-white-8 transition-all duration-300">
                    {row.getVisibleCells().map((cell, cellIdx) => {
                      const columnName = cell.column.id;
                      const rawValue = cell.row.original[columnName];
                      const isNumeric = typeof rawValue === 'number';
                      const bgColor = cellIdx > 0 ? getHeatmapColor(rawValue, columnName) : 'transparent';

                      return (
                        <td
                          key={cell.id}
                          className={`border-b border-r border-border-black-10 dark:border-background-white-15 px-2 max-lg:px-1.5 max-md:px-1 py-3 max-lg:py-2.5 max-md:py-2 text-color-black-100 dark:text-color-white-90 transition-all duration-300 ${cellIdx === 0 ? `sticky left-0 z-1 bg-background-light dark:bg-background-chart-dark before:content-[''] before:inset-0 before:absolute before:-z-2 ${idx%2===0 ? 'before:bg-background-black-4 dark:before:bg-background-white-8' : 'before:bg-background-light dark:before:bg-background-chart-dark'}` : ''} ${isNumeric || !rawValue ? 'text-right' : 'text-left'}`}
                          style={{
                            fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.td : '12px' : '10.5px',
                            fontWeight: cellIdx === 0 ? 600 : fontWeight.td,
                            // backgroundColor: bgColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {rawValue ? flexRender(cell.column.columnDef.cell, cell.getContext()) : '-'} {rawValue && isNumeric ? suffix : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPagination && (
        <div className="flex items-center justify-end mt-4 gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="w-7.5 max-lg:w-7.25 max-md:w-7 h-7.5 max-lg:h-7.25 max-md:h-7 flex justify-center items-center disabled:cursor-not-allowed cursor-pointer dark:border dark:border-background-white-15 dark:rounded-lg transition-all duration-300"
          >
            <figure><img src={!stateGlobals.darkMode ? iconArrowLeftGray : iconArrowLeftGrayDark} alt="Prev" className='w-1.25' /></figure>
          </button>

          {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
            const pageIndex = table.getState().pagination.pageIndex;
            let pageNum;

            if (table.getPageCount() <= 5) pageNum = i;
            else if (pageIndex < 3) pageNum = i;
            else if (pageIndex > table.getPageCount() - 4) pageNum = table.getPageCount() - 5 + i;
            else pageNum = pageIndex - 2 + i;

            return (
              <button
                key={pageNum}
                onClick={() => table.setPageIndex(pageNum)}
                className={`w-7.5 max-lg:w-7.25 max-md:w-7 h-7.5 max-lg:h-7.25 max-md:h-7 flex justify-center items-center rounded-lg font-medium transition-all dark:border dark:border-background-white-15 cursor-pointer text-sm max-lg:text-[13px] max-md:text-xs duration-300 ${pageIndex === pageNum ? 'bg-background-black-90 text-background-light dark:bg-background-white-8 shadow-md' : 'text-color-black-50 dark:text-color-white-80'}`}
              >
                {pageNum + 1}
              </button>
            );
          })}

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="w-7.5 max-lg:w-7.25 max-md:w-7 h-7.5 max-lg:h-7.25 max-md:h-7 flex justify-center items-center disabled:cursor-not-allowed cursor-pointer dark:border dark:border-background-white-15 dark:rounded-lg transition-all duration-300"
          >
            <figure><img src={!stateGlobals.darkMode ? iconArrowRightGray : iconArrowRightGrayDark} alt="Next" className='w-1.25' /></figure>
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(PivotTableChart);