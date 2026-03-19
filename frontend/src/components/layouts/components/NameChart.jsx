import IconInfor from './IconInfor';
import iConEyeHidden from '../../../assets/icon_eye_hidden.png'
import iConDownloadDark from '../../../assets/icon_download_dark.png'
import Button from '../headers/Button';
import { useState, useEffect, useRef } from 'react';
import iconInstruct from '../../../assets/icon_instruct.png';
import { toPng } from 'html-to-image';

const NameChart = ({ nameChart, description, icon=false, width='', height='', backgound='', display=true }) => {

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

  const handleHideChart = (event) => {
    if (!event.currentTarget) return;
    const chartParent = event.currentTarget.closest('.shadow-component');
    chartParent.classList.add('hidden');
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
        backgroundColor: '#ffffff'
    });

    const link = document.createElement('a');
    const dateStr = `${String(now.getDate()).padStart(2, '0')}_${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}h_${String(now.getMinutes()).padStart(2, '0')}m_${String(now.getSeconds()).padStart(2, '0')}s`;
    link.download = `${nameChart + '_' + dateStr}.png`;
    link.href = dataUrl;
    link.click();
    iconNone.classList.remove('hidden')
    errorSpan.classList.add('hidden');
    divTables.forEach(table => table?.classList.replace('overflow-hidden', 'overflow-auto'));
    errorSpan.textContent = '';
  };

  return (display &&
    (
      <div className='pb-6 text-[16px] font-semibold text-color-black-100 flex justify-between'>
        <div className='flex items-center gap-2'>
          {icon && <div className={`w-8 h-8 flex justify-center items-center rounded-lg ${backgound}`}><figure><img src={icon} className={`${width+' '+height+' '+backgound}`} /></figure></div>}
          <span>{nameChart}</span>
          <IconInfor description={description} />
        </div>
        <div className='flex gap-1 div-hideen'>
          <figure ref={buttonRef} className='p-2 cursor-pointer relative'>
            <img src={iConDownloadDark} alt="Icon Download" className='w-3.25' onClick={handleToggle} />
            <div ref={dropdownRef} className={`${isDropdownOpen ? 'scale-100 opacity-100 origin-top' : 'scale-0 opacity-0 origin-top'} left-1/2 -translate-x-1/2 transition-all duration-300 absolute top-full bg-background-light flex flex-col border border-border-black-10 rounded-xl w-28`}>
                  <div className='hover:bg-background-black-4 transition-all duration-300'>
                      <Button background={'bg-transparent'} color={'text-color-black-100'} src={iconInstruct}
                              widthImage='w-4' heightImage='h-4' alt='Icon Instruct' text={'Tải Ảnh'} click={handleChartCapture}
                              widthImage2='w-3.5' alt2='Icon Succes' />
                  </div>
                  <div className='hover:bg-background-black-4 transition-all duration-300'>
                      <Button background={'bg-transparent'} color={'text-color-black-100'} src={iconInstruct}
                      widthImage='w-4' heightImage='h-4' alt='Icon Instruct' text={'Tải Excel'} click={handleChartCapture}
                      widthImage2='w-3.5' alt2='Icon Succes' />
                  </div>
              </div>
            </figure>
          <figure className='p-2 cursor-pointer'><img src={iConEyeHidden} alt="Icon Eye Hidden" className='w-4.5' onClick={handleHideChart} />
          </figure>
        </div>
        <span className='text-color-error font-semibold text-xs hidden'></span>
      </div>
    )
  );
};

export default NameChart;