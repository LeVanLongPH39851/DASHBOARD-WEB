const ButtonFilter = ({ text, background, color, type, src=false, alt='', width='', height='' }) => {
  return (
    <button className={`${background} px-4 h-9.5 flex justify-center items-center gap-1 rounded-xl ${color} text-sm text-nowrap font-medium cursor-pointer transition-all duration-300`} type={`${type}`}>
      {src && (<figure><img src={src} alt={alt} className={`${width} ${height}`} /></figure>)}{text}
    </button>
  );
};

export default ButtonFilter;