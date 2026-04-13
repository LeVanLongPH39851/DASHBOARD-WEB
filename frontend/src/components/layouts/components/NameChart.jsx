import IconInfor from './IconInfor';
import iconEyeHidden from '../../../assets/icon_eye_hidden.png';
import iconDownloadDark from '../../../assets/icon_download_dark.png';
import iconEyeHiddenDark from '../../../assets/icon_eye_hidden_dark.png';
import iconDownloadDarkDark from '../../../assets/icon_download_dark_dark.png';
import Button from '../headers/Button';
import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas-pro';
import iconExcel from '../../../assets/icon_excel.png';
import iconIMG from '../../../assets/icon_img.png';
import iconList from '../../../assets/icon_list.png';
import iconListDark from '../../../assets/icon_list_dark.png';
import { useDashboardStateGlobals } from '../../../context/DashboardFilterContext';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';

const NameChart = ({ nameChart, description, icon=false, width='', height='', backgound='', display=true, opacity=false, getChartData=null, table=false, fullScreen=false }) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, userLoading } = useCurrentUser();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ ESC key close
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleToggle = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleHideChart = (event) => {
    if (!event.currentTarget) return;
    const chartParent = event.currentTarget.closest('.shadow-component');
    chartParent.classList.add('hidden');
  };

  const handlefullScreen = (event) => {
    if (!event.currentTarget) return;
    const chartParent = event.currentTarget.closest('.shadow-component');
    chartParent.classList.toggle('fixed');
    chartParent.classList.toggle('z-9999999');
    chartParent.classList.toggle('inset-0');
    const tableContainer = chartParent.querySelector('.table-container');
    if (tableContainer) {
      const heightTable = tableContainer.firstElementChild.firstElementChild;
      heightTable.classList.toggle('fullscreen-table');
    } else {
      chartParent.lastElementChild.classList.toggle('fullscreen-canvas');
      chartParent.lastElementChild.firstElementChild.classList.toggle('fullscreen-canvas');
      chartParent.lastElementChild.firstElementChild.firstElementChild.classList.toggle('fullscreen-canvas');
    }
  };

  const handleChartCapture = async (event) => {
    setIsDropdownOpen(false);
    if (!event.currentTarget) return;
    const chartParent = event.currentTarget.closest('.shadow-component');
    const iconNone = event.currentTarget.closest('.div-hideen');
    const parentIconNone = iconNone.parentElement;
    const errorSpan = parentIconNone.children[parentIconNone.children.length - 1];
    const divTables = document.querySelectorAll('.divTable');
    iconNone.classList.add('hidden');
    const now = new Date();
    const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    errorSpan.classList.remove('hidden');
    errorSpan.textContent = timeStr;
    divTables.forEach(table => table?.classList.replace('overflow-auto', 'overflow-hidden'));

    const dataUrl = await toPng(chartParent, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: null
    });

    const link = document.createElement('a');
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}m${String(now.getSeconds()).padStart(2, '0')}s`;
    link.download = `${nameChart + ' ' + dateStr}.png`;
    link.href = dataUrl;
    link.click();
    iconNone.classList.remove('hidden')
    errorSpan.classList.add('hidden');
    divTables.forEach(table => table?.classList.replace('overflow-hidden', 'overflow-auto'));
    errorSpan.textContent = '';
    setIsDropdownOpen(false);
  };

  const isFirefox = /firefox/i.test(navigator.userAgent);

  const waitForNextPaint = () =>
    new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const handleChartCaptureFireFox = async (event) => {
    setIsDropdownOpen(false);

    const trigger = event?.currentTarget;
    if (!trigger) return;

    const chartParent = trigger.closest('.shadow-component');
    const iconNone = trigger.closest('.div-hideen');
    const parentIconNone = iconNone?.parentElement;
    const errorSpan = parentIconNone?.children?.[parentIconNone.children.length - 1];
    const divTables = document.querySelectorAll('.divTable');

    if (!chartParent || !iconNone || !errorSpan) return;

    const now = new Date();
    const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    try {
      iconNone.classList.add('hidden');
      errorSpan.classList.remove('hidden');
      errorSpan.textContent = timeStr;
      divTables.forEach(table => table?.classList.replace('overflow-auto', 'overflow-hidden'));

      await waitForNextPaint();

      const canvas = await html2canvas(chartParent, {
        scale: isFirefox ? 1.5 : 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}m${String(now.getSeconds()).padStart(2, '0')}s`;

      const link = document.createElement('a');
      link.download = `${nameChart} ${dateStr}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Lỗi export chart PNG:', error);
    } finally {
      iconNone.classList.remove('hidden');
      errorSpan.classList.add('hidden');
      errorSpan.textContent = '';
      divTables.forEach(table => table?.classList.replace('overflow-hidden', 'overflow-auto'));
      setIsDropdownOpen(false);
    }
  };

  const handleChartExcel = async (event) => {
    if (!event.currentTarget) return;

    const chartData = getChartData();
    console.log('Excel data:', chartData);

    try {
      // ✅ Lấy data từ ECharts
      if (typeof getChartData !== 'function') return;
      const chartData = getChartData();

      const labels = chartData.labels || [];
      const series = chartData.series || [];

      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const safeNameChart = nameChart.replace(/[\\/:*?"<>|]/g, '_');
      const worksheet = workbook.addWorksheet(safeNameChart);

      const now = new Date();
      const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      const totalCols = 1 + 1 + series.length + (series.length > 1 ? 1 : 0);
      const timeRow = worksheet.addRow([timeStr]);
      worksheet.mergeCells(1, 1, 1, totalCols);
      timeRow.getCell(1).font = { italic: true, color: { argb: 'AFF383C' } };
      timeRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

      // ✅ HEADER ROW: Label | Series1 | Series2 | ... | Tổng
      const headerRow = worksheet.addRow([
        'STT',
        'Label',
        ...series.map(s => s.name || 'Value'),
        ...(series.length > 1 ? ['Tổng'] : [])  // Chỉ thêm Tổng nếu có nhiều series
      ]);

      // Style header: bold + background
      headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });

      // ✅ DATA ROWS
      labels.forEach((label, i) => {
        const rowValues = [i + 1, label];
        let rowTotal = 0;

        series.forEach(s => {
          const val = s.data?.[i] || 0;
          rowValues.push(val);
          rowTotal += val;
        });

        if (series.length > 1) rowValues.push(rowTotal);  // Cột Tổng

        const dataRow = worksheet.addRow(rowValues);

        // Style data row
        dataRow.eachCell((cell, colNumber) => {
          cell.alignment = { horizontal: colNumber <= 2 ? 'left' : 'right', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };
          // Format số

          if (colNumber === 1) {
            cell.font = { bold: true };
          }

        });
      });

      // ✅ TỔNG CỘNG ROW cuối
      const totalValues = ['', 'TỔNG'];
      let grandTotal = 0;
      series.forEach(s => {
        const total = (s.data || []).reduce((sum, v) => sum + (v || 0), 0);
        totalValues.push(total);
        grandTotal += total;
      });
      if (series.length > 1) totalValues.push(grandTotal);

      const totalRow = worksheet.addRow(totalValues);
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4FF' } };
        cell.alignment = { horizontal: colNumber <= 2 ? 'left' : 'right', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium' }, left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'medium' }, right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });

      // ✅ Auto width cột
      const colWidths = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;  // ✅ Bỏ qua dòng timeStr

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const len = cell.value ? cell.value.toString().length : 0;
          colWidths[colNumber] = Math.max(colWidths[colNumber] || 8, len);
        });
      });

      colWidths.forEach((width, colNumber) => {
        if (colNumber > 0) {
          worksheet.getColumn(colNumber).width = Math.min(width + 2, 40);  // +4 padding, max 40
        }
      });

      if (series.length > 1) {
        const lastColNum = 2 + series.length + 1;  // STT + Label + series + Tổng
        
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 2) return;  // ✅ Bỏ qua HEADER row (màu trắng)
          if (rowNumber === 1) return;  // Bỏ qua timeStr
          
          const lastCell = row.getCell(lastColNum);
          if (lastCell.value !== null && lastCell.value !== undefined) {
            lastCell.font = { bold: true };
          }
        });
      }

      // ✅ Export file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}m${String(now.getSeconds()).padStart(2, '0')}s`;
      const link = document.createElement('a');
      link.download = `${safeNameChart} ${dateStr}.xlsx`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);  // ✅ Giải phóng bộ nhớ

    } catch (error) {
      console.error('Excel export error:', error);
    } finally {
        setIsDropdownOpen(false);
    }
  };

  const handleChartExcelTable = async (event) => {
    if (!event.currentTarget) return;

    try {
        // ✅ Lấy data từ ECharts
        if (typeof getChartData !== 'function') return;
        const chartData = getChartData();

        const labels = chartData.labels || [];
        const series = chartData.series || [];

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const safeNameChart = nameChart.replace(/[\\/:*?"<>|]/g, '_');
        const worksheet = workbook.addWorksheet(safeNameChart);

        const now = new Date();
        const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        const totalCols = 1 + series.length; // ✅ +1 cho cột STT
        const timeRow = worksheet.addRow([timeStr]);
        worksheet.mergeCells(1, 1, 1, totalCols);
        timeRow.getCell(1).font = { italic: true, color: { argb: 'AFF383C' } };
        timeRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

        // ✅ HEADER ROW: STT + các series name
        const headerRow = worksheet.addRow(['STT', ...series.map(s => s.name || 'Value')]);

        // Style header: bold + background
        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' }
            };
        });

        // ✅ DATA ROWS: STT + label + data
        labels.forEach((label, i) => {
            const rowValues = [label + 1]; // ✅ Cột STT (label)

            series.forEach(s => {
                const val = s.data?.[i] || 0;
                rowValues.push(val);
            });

            const dataRow = worksheet.addRow(rowValues);

            // Style data row
            dataRow.eachCell((cell, colNumber) => {
                cell.alignment = { horizontal: colNumber === 1 ? 'left' : 'right', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
                };
                
                if (colNumber === 1) {
                    cell.font = { bold: true };
                }
            });
        });

        // ✅ Auto width cột
        const colWidths = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;  // Bỏ qua dòng timeStr

            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const len = cell.value ? cell.value.toString().length : 0;
                colWidths[colNumber] = Math.max(colWidths[colNumber] || 8, len);
            });
        });

        colWidths.forEach((width, colNumber) => {
            if (colNumber > 0) {
                worksheet.getColumn(colNumber).width = Math.min(width + 2, 40);
            }
        });

        // ✅ Export file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}m${String(now.getSeconds()).padStart(2, '0')}s`;
        const link = document.createElement('a');
        link.download = `${safeNameChart} ${dateStr}.xlsx`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Excel export error:', error);

    } finally {
        setIsDropdownOpen(false);
    }
  };

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  return (
      <div className={`${opacity ? 'opacity-0 invisible' : ''} pb-6 max-lg:pb-5 max-md:pb-4 text-[16px] max-lg:text-sm max-md:text-xs font-semibold text-color-black-100 dark:text-color-white-90 transition-all duration-300 flex justify-between ${!display ? 'absolute top-0 left-0 w-full p-6 max-lg:p-5 max-md:p-4' : ''}`}>
        <div className='flex items-center gap-2 max-lg:gap-1.5 max-md:gap-1 text-nowrap'>
          {icon && <div className={`w-8 h-8 max-lg:w-7.5 max-lg:h-7.5 max-md:w-7 max-md:h-7 max-md:hidden flex justify-center items-center rounded-lg ${backgound} transition-all duration-300`}><figure><img src={icon} className={`${width+' '+height+' '+backgound}`} /></figure></div>}
          <span>{nameChart}</span>
          {description && <IconInfor description={description} />}
        </div>
        <div className='flex gap-1 items-center div-hideen max-md:hidden'>
          {(!userLoading && user?.username !== 'vtvguest' && fullScreen) &&
            (
              <figure className='p-2 cursor-pointer' onClick={handlefullScreen}>
                <FontAwesomeIcon icon={faExpand} fontSize={!stateGlobals.screen_lg ? 15 : 14} color={!stateGlobals.darkMode ? 'rgba(31, 31, 31, 1)' : 'rgba(255, 255, 255, 0.8)'} />
              </figure>
            )
          }
          {(!userLoading && user?.username !== 'vtvguest') &&
          (<figure ref={!stateGlobals.screen_md ? buttonRef : undefined} className='p-2 cursor-pointer relative' onClick={handleToggle}>
            <img src={!stateGlobals.darkMode ? iconDownloadDark : iconDownloadDarkDark} alt="Icon Download" className='w-3.25 max-lg:w-3' />
            <div ref={!stateGlobals.screen_md ? dropdownRef : undefined} className={`${isDropdownOpen ? 'scale-100 opacity-100 origin-top' : 'scale-0 opacity-0 origin-top'} left-1/2 -translate-x-1/2 transition-all duration-300 absolute z-20 top-full bg-background-light dark:bg-background-dark dark:border-background-white-15 flex flex-col border border-border-black-10 rounded-xl w-28 overflow-hidden`}>
                <div onClick={!isFirefox ? handleChartCapture : handleChartCaptureFireFox} className='hover:bg-background-black-4 dark:hover:bg-background-hover-dark transition-all duration-300'>
                    <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-90'} src={iconIMG}
                            widthImage='w-4 max-lg:w-3.75 max-md:w-3.75' alt='Icon Instruct' text={'Tải Ảnh'} />
                </div>
                <div onClick={table ? handleChartExcelTable : handleChartExcel} className='hover:bg-background-black-4 dark:hover:bg-background-hover-dark transition-all duration-300'>
                    <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-90'} src={iconExcel}
                    widthImage='w-4 max-lg:w-3.75 max-md:w-3.75' alt='Icon Instruct' text={'Tải Excel'} />
                </div>
            </div>
          </figure>)}
          <figure className='p-2 cursor-pointer'><img src={!stateGlobals.darkMode ? iconEyeHidden : iconEyeHiddenDark} alt="Icon Eye Hidden" className='w-4.5 max-lg:w-4' onClick={handleHideChart} /></figure>
        </div>
        <div className='hidden div-hideen max-md:block'>
          <figure ref={stateGlobals.screen_md ? buttonRef : undefined} className='p-2 max-md:px-0 cursor-pointer relative' onClick={handleToggle}>
            <img src={!stateGlobals.darkMode ? iconList : iconListDark} alt="Icon List" className='w-2.75' />
            <div ref={stateGlobals.screen_md ? dropdownRef : undefined} className={`${isDropdownOpen ? 'scale-100 opacity-100 origin-top max-md:origin-top-right' : 'scale-0 opacity-0 origin-top max-md:origin-top-right'} left-1/2 -translate-x-1/2 max-md:left-auto max-md:translate-x-0 max-md:right-0 transition-all duration-300 absolute z-20 top-full bg-background-light dark:bg-background-dark dark:border-background-white-15 flex flex-col border border-border-black-10 rounded-xl w-28 overflow-hidden`}>
                {(!userLoading && user?.username !== 'vtvguest') &&
                (<div onClick={!isFirefox ? handleChartCapture : handleChartCaptureFireFox} className='hover:bg-background-black-4 dark:hover:bg-background-hover-dark transition-all duration-300'>
                    <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-90'} src={iconIMG}
                            widthImage='w-4 max-md:w-3.5' alt='Icon Instruct' text={'Tải Ảnh'} />
                </div>)}
                {(!userLoading && user?.username !== 'vtvguest') &&
                (<div onClick={table ? handleChartExcelTable : handleChartExcel} className='hover:bg-background-black-4 dark:hover:bg-background-hover-dark transition-all duration-300'>
                    <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-90'} src={iconExcel}
                    widthImage='w-4 max-md:w-3.5' alt='Icon Instruct' text={'Tải Excel'} />
                </div>)}
                <div className='hover:bg-background-black-4 dark:hover:bg-background-hover-dark transition-all duration-300'>
                    <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-90'} src={!stateGlobals.darkMode ? iconEyeHidden : iconEyeHiddenDark}
                    widthImage='w-4.5 max-md:w-3.5' alt='Icon Eye Hidden' text={'Ẩn biểu đồ'} click={handleHideChart} />
                </div>
            </div>
          </figure>
        </div>
        <span className='text-color-error font-semibold text-xs max-lg:text-[11px] hidden max-md:hidden'></span>
      </div>
  );
};

export default NameChart;