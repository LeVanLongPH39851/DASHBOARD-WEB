import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';

const InconInfor = ({ description }) => {
  return (
    <span className='ml-2 text-xs text-color-icon-infor group relative'>
      <div className='border border-color-icon-infor rounded-full w-5 h-5 flex justify-center items-center hover:border-2 transition-transform cursor-pointer'>
        <FontAwesomeIcon icon={faInfo} />
        <div className="bottom-[50%] invisible group-hover:visible opacity-0 group-hover:opacity-100 w-50 bg-color-dark absolute p-4 rounded-xl shadow-2xl before:content-[''] before:absolute before:w-3
                        before:h-3 before:bg-color-dark before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:translate-y-1/2
                        before:rotate-45 group-hover:bottom-full transition-all">
          <p className='text-white w-full'>{description}</p>
        </div>
      </div>
    </span>
  );
};

export default InconInfor;