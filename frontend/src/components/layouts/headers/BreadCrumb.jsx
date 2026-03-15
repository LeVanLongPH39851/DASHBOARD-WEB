import iconHome from '../../../assets/icon_home.png';
import iconArrowRight from '../../../assets/icon_arrow_right.png';
import iconDisplay from '../../../assets/icon_display.png';
import iconInstruct from '../../../assets/icon_instruct.png';
import iconSucces from '../../../assets/icon_succes.png';
import iconDownload from '../../../assets/icon_download.png';
import Button from './Button';

const BreadCrumb = () => {
  return (
    <nav className='px-6 bg-background-light pt-2 pb-1 sticky top-0' style={{zIndex: 100}}>
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
                <Button background={'bg-background-black-4'} color={'text-color-black-100'} src={iconInstruct}
                            widthImage='w-4' heightImage='h-4' alt='Icon Instruct' text={'Hướng dẫn'} src2={iconSucces}
                            widthImage2='w-3.5' alt2='Icon Succes' />
                <Button background={'bg-color-black-100'} color={'text-color-white-90'} src={iconDownload}
                            widthImage='w-3.5' heightImage='h-3.5' alt='Icon Download' text={'Tải xuống'} />
            </div>
        </div>
    </nav>
  );
};

export default BreadCrumb;