import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

const IconInfor = ({ description }) => {
  return (
    <span className='text-sm text-color-black-50 group relative cursor-pointer'>
      <div className='flex justify-center'>
        <FontAwesomeIcon icon={faCircleInfo} />
        <div className="bottom-[50%] font-medium invisible group-hover:visible opacity-0 group-hover:opacity-100 max-w-96 bg-color-black-100 absolute px-4 py-3 rounded-xl shadow-2xl before:content-[''] before:absolute before:w-3
                        before:h-3 before:bg-color-black-100 before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:translate-y-1/2
                        before:rotate-45 group-hover:bottom-full transition-all z-10">
          <p className='text-color-white-90 w-full whitespace-nowrap'>{description}</p>
        </div>
      </div>
    </span>
  );
};

export default IconInfor;