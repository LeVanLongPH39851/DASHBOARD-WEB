import iconHome from '../../../assets/icon_home.png';
import iconArrowRight from '../../../assets/icon_arrow_right.png';
import iconDisplay from '../../../assets/icon_display.png';
import iconInstruct from '../../../assets/icon_instruct.png';
import iconSucces from '../../../assets/icon_succes.png';
import iconDownload from '../../../assets/icon_download.png';
import Button from './Button';
import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas-pro';
import { useDashboardStateGlobals } from '../../../context/DashboardFilterContext';
import iconPDF from '../../../assets/icon_pdf.png';
import iconIMG from '../../../assets/icon_img.png';

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

        inforTabSticky.classList.replace('top-34', 'top-0');
        inforFilterSticky.classList.replace('top-46', 'top-12');
        divTables.forEach(table => table?.classList.replace('overflow-auto', 'overflow-hidden'));
        const now = new Date();

        const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        exportTime.textContent = timeStr;

        const dataUrl = await toPng(target, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
        });

        const link = document.createElement('a');
        const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}m${String(now.getSeconds()).padStart(2, '0')}s`;
        link.download = `Report Dashboard VTVRatings ${LABEL_TABS[stateGlobals.currentTab]} ${dateStr}.png`;
        link.href = dataUrl;
        link.click();

        inforTabSticky.classList.replace('top-0', 'top-34');
        inforFilterSticky.classList.replace('top-12', 'top-46');
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

        inforTabSticky.classList.replace('top-34', 'top-0');
        inforFilterSticky.classList.replace('top-46', 'top-12');
        divTables.forEach(table => table?.classList.replace('overflow-auto', 'overflow-hidden'));
        const now = new Date();

        const timeStr = `Thời gian export: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        exportTime.textContent = timeStr;

        try {
            // ✅ CONFIG GIỐNG HỆT handleCapture
            const canvas = await html2canvas(target, {
                scale: 2,
                backgroundColor: '#ffffff',
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
            inforTabSticky.classList.replace('top-0', 'top-34');
            inforFilterSticky.classList.replace('top-12', 'top-46');
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
    <nav className='px-6 bg-background-light pt-2 pb-1 sticky top-0' style={{zIndex: 300}}>
        <div className='flex items-center gap-2'>
            <figure><img src={iconHome} className='w-3 h-3' alt="Icon Home" /></figure>
            <span className='text-sm font-medium text-color-black-50'>Bảng điều khiển</span>
            <figure><img src={iconArrowRight} className='h-2.75' alt="Icon Arrow Right" /></figure>
            <span className='text-sm font-medium text-color-black-100'>Kênh truyền hình</span>
        </div>
        <div className='pt-2 flex justify-between'>
            <h1 className='text-[32px] font-semibold text-color-black-100'>Kênh truyền hình VTV</h1>
            <div className='flex items-center gap-4'>
                <Button background={'bg-background-black-4'} color={'text-color-black-100'} src={iconDisplay}
                            widthImage='w-3.75' heightImage='h-3.75' alt='Icon Display' text={'Quản lý hiển thị'} />
                <a href="https://neotam.ami.vn/" target='_blank'>
                    <Button background={'bg-background-black-4'} color={'text-color-black-100'} src={iconInstruct}
                            widthImage='w-4' heightImage='h-4' alt='Icon Instruct' text={'Hướng dẫn'} src2={iconSucces}
                            widthImage2='w-3.5' alt2='Icon Succes' />
                </a>
                <div className='relative'>
                    <div ref={buttonRef}>
                        <Button background={'bg-color-black-100'} color={'text-color-white-90'} src={iconDownload}
                            widthImage='w-3.5' heightImage='h-3.5' alt='Icon Download' text={'Tải xuống'} click={handleToggle}/>
                    </div>
                    <div ref={dropdownRef} className={`${isDropdownOpen ? 'scale-100 opacity-100 origin-top' : 'scale-0 opacity-0 origin-top'} transition-all duration-300 absolute top-full left-0 bg-background-light flex flex-col border border-border-black-10 rounded-xl w-full overflow-hidden`}>
                            <div className='hover:bg-background-black-4 transition-all duration-300'>
                                <Button background={'bg-transparent'} color={'text-color-black-100'} src={iconIMG}
                                        widthImage='w-4' alt='Icon Instruct' text={'Tải Ảnh'} click={handleCapture} />
                            </div>
                            <div className='hover:bg-background-black-4 transition-all duration-300'>
                                <Button background={'bg-transparent'} color={'text-color-black-100'} src={iconPDF}
                                widthImage='w-4' alt='Icon Instruct' text={'Tải PDF'} click={handlePDF} />
                            </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    );
};

export default BreadCrumb;