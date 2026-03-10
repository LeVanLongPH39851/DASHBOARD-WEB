import logoVTVRatings from '../../../assets/logo_vtvratings.png';
import iconLanguge from '../../../assets/icon_language.png';
import iconArrowDown from '../../../assets/icon_arrow_down.png';
import iconDarkMode from '../../../assets/icon_dark_mode.png';
import imageUser from '../../../assets/image_user.png';

const Header = () => {
  return (
    <header className="h-15 bg-background-light px-6 py-px flex justify-between items-center border-b border-border-black-10 sticky top-0" style={{zIndex: 100}}>
        <figure>
            <img src={logoVTVRatings} className='h-14.5' alt="Logo VTVRatings" />
        </figure>
        <div className='flex items-center'>
            <div className='flex items-center gap-2'>
                <div className='flex items-center gap-2 py-2 px-4'>
                    <figure><img src={iconLanguge} className='w-4 h-4' alt="Icon Language" /></figure>
                    <span className='text-[16px] font-medium text-color-black-100'>English</span>
                    <figure><img src={iconArrowDown} className='w-2.25' alt="Icon Arrow Down" /></figure>
                </div>
                <figure className='p-2'>
                    <img src={iconDarkMode} className='w-4.5 h-4.5' alt="Icon Dark Mode" />
                </figure>
            </div>
            <div className='w-px h-6 rounded-full bg-background-line-gray mx-2'></div>
            <div className='flex items-center gap-2'>
                <figure>
                    <img src={imageUser} className='w-10 h-10' alt="Image User" />
                </figure>
                <div className='flex flex-col justify-between'>
                    <span className='text-[16px] font-medium text-color-gray-800'>07:25:11 AM</span>
                    <span className='text-xs font-medium text-color-gray-600'>April 27, 2023</span>
                </div>
                <figure><img src={iconArrowDown} className='w-2.25' alt="Icon Arrow Down" /></figure>
            </div>
        </div>
    </header>
  );
};

export default Header;