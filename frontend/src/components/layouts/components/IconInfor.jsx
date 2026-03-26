import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useDashboardStateGlobals } from '../../../context/DashboardFilterContext';

const IconInfor = ({ description }) => {
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  return (
    <span className='text-xs max-md:text-[10px] text-color-black-50 group relative cursor-pointer'>
      <div className='flex justify-center'>
        <FontAwesomeIcon icon={faCircleInfo} color={!stateGlobals.darkMode ? 'rgba(19, 20, 20, 0.7)' : 'rgba(255, 255, 255, 0.5)'} />
        <div className="bottom-[50%] font-medium invisible group-hover:visible opacity-0 group-hover:opacity-100 max-w-96 bg-color-black-100 dark:bg-background-dark absolute px-4 py-3 rounded-md shadow-tooltip before:content-[''] before:absolute before:w-3
                        before:h-3 before:bg-color-black-100 dark:before:bg-background-dark before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:translate-y-1/2
                        before:rotate-45 group-hover:bottom-[115%] transition-all duration-300 z-10">
          <p className='text-color-white-90 w-full whitespace-nowrap'>{description}</p>
        </div>
      </div>
    </span>
  );
};

export default IconInfor;