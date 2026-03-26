import iconHome from '../../../assets/icon_home.png';
import iconHomeDark from '../../../assets/icon_home_dark.png';
import iconArrowRight from '../../../assets/icon_arrow_right.png';
import iconDisplay from '../../../assets/icon_display.png';
import iconInstruct from '../../../assets/icon_instruct.png';
import iconSucces from '../../../assets/icon_succes.png';
import iconDownload from '../../../assets/icon_download.png';
import iconDisplayDark from '../../../assets/icon_display_dark.png';
import iconInstructDark from '../../../assets/icon_instruct_dark.png';
import iconDownloadDark from '../../../assets/icon_download_dark_mode.png';
import Button from './Button';
import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas-pro';
import { useDashboardStateGlobals } from '../../../context/DashboardFilterContext';
import iconPDF from '../../../assets/icon_pdf.png';
import iconIMG from '../../../assets/icon_img.png';
import iconList from '../../../assets/icon_list.png';
import iconArrowLeft2 from '../../../assets/icon_arrow_left_2.png';
import iconListDark from '../../../assets/icon_list_dark.png';
import iconArrowLeft2Dark from '../../../assets/icon_arrow_left_2_dark.png';

const BreadCrumb = () => {
    const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
    const LABEL_TABS = {
        overview: 'Tổng quan',
        channel: 'Kênh',
        program: 'Chương trình',
        rating_by_minute: 'Rating theo phút'
    }

    const handleCapture = async () => {
        const target = document.getElementById(`target_capture_${stateGlobals.currentTab}`);

        if (!target) return;

        const inforTabSticky = document.getElementById('inforTabSticky');
        const inforFilterSticky = document.getElementById('inforFilterSticky');
        const divTables = document.querySelectorAll('.divTable');
        const exportTime = document?.getElementById('exportTime');

        inforTabSticky.classList.replace('transition-all', 'transition-delete');
        inforFilterSticky.classList.replace('transition-all', 'transition-delete');
        inforTabSticky.classList.replace('duration-300', 'duration-delete');
        inforFilterSticky.classList.replace('duration-300', 'duration-delete');
        inforTabSticky.classList.replace('top-34', 'top-0');
        inforTabSticky.classList.replace('max-md:top-18', 'max-md:top-0');
        inforFilterSticky.classList.replace('top-46', 'top-12');
        inforFilterSticky.classList.replace('max-md:top-28', 'max-md:top-10');
        divTables.forEach(table => table?.classList.replace('overflow-auto', 'overflow-hidden'));
        const now = new Date();

        const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        exportTime.textContent = timeStr;

        const dataUrl = await toPng(target, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: null
        });

        const link = document.createElement('a');
        const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}m${String(now.getSeconds()).padStart(2, '0')}s`;
        link.download = `Report Dashboard VTVRatings ${LABEL_TABS[stateGlobals.currentTab]} ${dateStr}.png`;
        link.href = dataUrl;
        link.click();

        inforTabSticky.classList.replace('transition-delete', 'transition-all');
        inforFilterSticky.classList.replace('transition-delete', 'transition-all');
        inforTabSticky.classList.replace('duration-delete', 'duration-300');
        inforFilterSticky.classList.replace('duration-delete', 'duration-300');
        inforTabSticky.classList.replace('top-0', 'top-34');
        inforTabSticky.classList.replace('max-md:top-0', 'max-md:top-18');
        inforFilterSticky.classList.replace('top-12', 'top-46');
        inforFilterSticky.classList.replace('max-md:top-10', 'max-md:top-28');
        divTables.forEach(table => table?.classList.replace('overflow-hidden', 'overflow-auto'));
        exportTime.textContent = '';
    };

    const handlePDF = async () => {
        const target = document.getElementById(`target_capture_${stateGlobals.currentTab}`);

        if (!target) {
            console.error('Không tìm thấy target element');
            return;
        }

        const inforTabSticky = document.getElementById('inforTabSticky');
        const inforFilterSticky = document.getElementById('inforFilterSticky');
        const divTables = document.querySelectorAll('.divTable');
        const exportTime = document?.getElementById('exportTime');

        inforTabSticky.classList.replace('transition-all', 'transition-delete');
        inforFilterSticky.classList.replace('transition-all', 'transition-delete');
        inforTabSticky.classList.replace('duration-300', 'duration-delete');
        inforFilterSticky.classList.replace('duration-300', 'duration-delete');
        inforTabSticky.classList.replace('top-34', 'top-0');
        inforTabSticky.classList.replace('max-md:top-18', 'max-md:top-0');
        inforFilterSticky.classList.replace('top-46', 'top-12');
        inforFilterSticky.classList.replace('max-md:top-28', 'max-md:top-10');
        divTables.forEach(table => table?.classList.replace('overflow-auto', 'overflow-hidden'));
        const now = new Date();

        const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        exportTime.textContent = timeStr;

        try {
            // ✅ CONFIG GIỐNG HỆT handleCapture
            const canvas = await html2canvas(target, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}m${String(now.getSeconds()).padStart(2, '0')}s`;

            // ✅ FIX jsPDF: Tạo PDF đơn giản 1 trang, KHÔNG multi-page
            const { jsPDF } = await import('jspdf');
            
            // ✅ VALIDATE kích thước trước khi tạo
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const pdfWidth = 190;  // A4 - margin
            const pdfHeight = Math.max(50, (canvasHeight * pdfWidth) / canvasWidth);  // Min 50mm
            
            console.log(`Canvas: ${canvasWidth}x${canvasHeight} → PDF: ${pdfWidth}x${pdfHeight}mm`);

            const pdf = new jsPDF('p', 'mm', 'a4');  // Portrait cố định, an toàn
            
            // ✅ SINGLE PAGE - ĐẸP NHƯ PNG
            pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);

            pdf.save(`Report Dashboard VTVRatings ${LABEL_TABS[stateGlobals.currentTab]} ${dateStr}.pdf`);
            console.log('✅ PDF created successfully!');

        } catch (error) {
            console.error('❌ Lỗi tạo PDF:', error);
        } finally {
            inforTabSticky.classList.replace('transition-delete', 'transition-all');
            inforFilterSticky.classList.replace('transition-delete', 'transition-all');
            inforTabSticky.classList.replace('duration-delete', 'duration-300');
            inforFilterSticky.classList.replace('duration-delete', 'duration-300');
            inforTabSticky.classList.replace('top-0', 'top-34');
            inforTabSticky.classList.replace('max-md:top-0', 'max-md:top-18');
            inforFilterSticky.classList.replace('top-12', 'top-46');
            inforFilterSticky.classList.replace('max-md:top-10', 'max-md:top-28');
            divTables.forEach(table => table?.classList.replace('overflow-hidden', 'overflow-auto'));
            exportTime.textContent = '';
        }
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

    return (
    <nav className='px-6 max-md:px-4 bg-background-light dark:bg-background-dark border-b border-border-black-10 dark:border-transparent transition-all duration-300 pt-2 pb-1 sticky top-0' style={{zIndex: 300}}>
        <div className='flex items-center gap-2 max-md:hidden'>
            <figure><img src={!stateGlobals.darkMode ? iconHome : iconHomeDark} className='w-3 h-3' alt="Icon Home" /></figure>
            <span className='text-sm font-medium text-color-black-50 dark:text-color-white-50 transition-all duration-300'>Bảng điều khiển</span>
            <figure><img src={iconArrowRight} className='h-2.75' alt="Icon Arrow Right" /></figure>
            <span className='text-sm font-medium text-color-black-100 dark:text-color-white-90 transition-all duration-300'>Kênh truyền hình</span>
        </div>
        <div className='pt-2 flex justify-between items-center'>
            <div className='flex items-center'>
                <figure className='cursor-pointer p-2 pl-0 mr-2 hidden max-md:block'><img src={!stateGlobals.darkMode ? iconArrowLeft2 : iconArrowLeft2Dark} className='w-3.5' alt="Icon Arrow Left 2" /></figure>
                <h1 className='text-[32px] max-md:text-lg font-semibold text-color-black-100 dark:text-color-white-90 transition-all duration-300'>Kênh truyền hình VTV</h1>
            </div>
            <div className='flex items-center gap-4 max-md:hidden'>
                <Button background={'bg-background-black-4 dark:bg-background-white-15'} color={'text-color-black-100 dark:text-color-white-80'} src={!stateGlobals.darkMode ? iconDisplay : iconDisplayDark}
                            widthImage='w-3.75' heightImage='h-3.75' alt='Icon Display' text={'Quản lý hiển thị'} />
                <a href="https://neotam.ami.vn/" target='_blank'>
                    <Button background={'bg-background-black-4 dark:bg-background-white-15'} color={'text-color-black-100 dark:text-color-white-80'} src={!stateGlobals.darkMode ? iconInstruct : iconInstructDark}
                            widthImage='w-4' heightImage='h-4' alt='Icon Instruct' text={'Hướng dẫn'} src2={iconSucces}
                            widthImage2='w-3.5' alt2='Icon Succes' />
                </a>
                <div className='relative'>
                    <div ref={buttonRef}>
                        <Button background={'bg-color-black-100 dark:bg-background-primary'} color={'text-color-white-90 dark:text-color-black-100'} src={!stateGlobals.darkMode ? iconDownload : iconDownloadDark}
                            widthImage='w-3.5' heightImage='h-3.5' alt='Icon Download' text={'Tải xuống'} click={handleToggle}/>
                    </div>
                    <div ref={dropdownRef} className={`${isDropdownOpen ? 'scale-100 opacity-100 origin-top' : 'scale-0 opacity-0 origin-top'} transition-all duration-300 absolute top-full left-0 bg-background-light dark:bg-background-dark flex flex-col border border-border-black-10 dark:border-background-white-15 rounded-xl w-full overflow-hidden`}>
                            <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                                <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-80'} src={iconIMG}
                                        widthImage='w-4' alt='Icon Instruct' text={'Tải Ảnh'} click={handleCapture} />
                            </div>
                            <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                                <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-80'} src={iconPDF}
                                widthImage='w-4' alt='Icon Instruct' text={'Tải PDF'} click={handlePDF} />
                            </div>
                    </div>
                </div>
            </div>
            <div className='hidden max-md:block relative'>
                <figure ref={buttonRef} className='cursor-pointer p-2' onClick={handleToggle}>
                    <img src={!stateGlobals.darkMode ? iconList : iconListDark} className='w-3.5' alt="Icon List" />
                </figure>
                <div ref={dropdownRef} className={`${isDropdownOpen ? 'scale-100 opacity-100 origin-top-right' : 'scale-0 opacity-0 origin-top-right'} transition-all duration-300 absolute top-full right-0 bg-background-light dark:bg-background-dark flex flex-col border border-border-black-10 dark:border-background-white-15 rounded-xl w-33.75 overflow-hidden`}>
                        <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                            <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-80'} src={!stateGlobals.darkMode ? iconDisplay : iconDisplayDark}
                            widthImage='w-3.75 max-md:w-3' heightImage='h-3.75 max-md:h-3' alt='Icon Display' text={'Quản lý hiển thị'} />
                        </div>
                        <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                            <a href="https://neotam.ami.vn/" target='_blank'>
                                <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-80'} src={!stateGlobals.darkMode ? iconInstruct : iconInstructDark}
                                        widthImage='w-4 max-md:w-3' heightImage='h-4 max-md:h-3' alt='Icon Instruct' text={'Hướng dẫn'} src2={iconSucces}
                                        widthImage2='w-3.5 max-md:w-2.5' alt2='Icon Succes' />
                            </a>
                        </div>
                        <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                            <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-80'} src={iconIMG}
                                        widthImage='w-4 max-md:w-3.5' alt='Icon Instruct' text={'Tải Ảnh'} click={handleCapture} />
                        </div>
                        <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                            <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-80'} src={iconPDF}
                                widthImage='w-4 max-md:w-3.5' alt='Icon Instruct' text={'Tải PDF'} click={handlePDF} />
                        </div>
                </div>
            </div>
        </div>
        <div className='items-center gap-2 hidden max-md:flex mt-2'>
            <figure><img src={!stateGlobals.darkMode ? iconHome : iconHomeDark} className='w-3 h-3 max-md:w-2.5 max-md:h-2.5' alt="Icon Home" /></figure>
            <span className='text-sm max-md:text-xs font-medium text-color-black-50 dark:text-color-white-50 transition-all duration-300'>Bảng điều khiển</span>
            <figure><img src={iconArrowRight} className='h-2.75' alt="Icon Arrow Right" /></figure>
            <span className='text-sm max-md:text-xs font-medium text-color-black-100 dark:text-color-white-90 transition-all duration-300'>Kênh truyền hình</span>
        </div>
    </nav>
    );
};

export default BreadCrumb;