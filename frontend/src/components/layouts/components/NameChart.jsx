import IconInfor from './IconInfor';
import iConEyeHidden from '../../../assets/icon_eye_hidden.png'
import iConDownloadDark from '../../../assets/icon_download_dark.png'

const NameChart = ({ nameChart, description, icon=false, width='', height='', backgound='', display=true }) => {
  return (display &&
    (
      <div className='pb-6 text-[16px] font-semibold text-color-black-100 flex justify-between'>
        <div className='flex items-center gap-2'>
          {icon && <div className={`w-8 h-8 flex justify-center items-center rounded-lg ${backgound}`}><figure><img src={icon} className={`${width+' '+height+' '+backgound}`} /></figure></div>}
          <span>{nameChart}</span>
          <IconInfor description={description} />
        </div>
        <div className='flex gap-1'>
          <figure className='p-2 cursor-pointer'><img src={iConDownloadDark} alt="Icon Download" className='w-3.25' /></figure>
          <figure className='p-2 cursor-pointer'><img src={iConEyeHidden} alt="Icon Eye Hidden" className='w-4.5' /></figure>
        </div>
      </div>
    )
  );
};

export default NameChart;