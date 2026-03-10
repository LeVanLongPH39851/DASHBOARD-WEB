const ButtonFilter = ({ text, background, color, type }) => {
  return (
    <button className={`${background} px-3 py-1.5 rounded-sm ${color} text-sm text-nowrap font-semibold cursor-pointer`} type={`${type}`}>
      {text}
    </button>
  );
};

export default ButtonFilter;