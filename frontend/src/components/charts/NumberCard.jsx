import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const NumberCard = ({ title, value, icon, color, background, suffix = '' }) => {
  return (
    <div className="bg-background-light p-6 rounded-xl h-30 flex items-center">
      <div className={`mr-4 w-16 h-16 rounded-full ${background} flex justify-center items-center`}>
      <FontAwesomeIcon icon={icon} className={`${color} text-2xl`} />
      </div>
      <div>
      <p className="text-color-gray text-[14px] font-normal leading-6 tracking-normal mb-0.5">{title}</p>
      <p className="text-color-dark text-[28px] font-semibold leading-[100%] tracking-[-4%]">
        {value?.toLocaleString()} {suffix}
      </p>
      </div>
    </div>
  );
};

export default NumberCard;