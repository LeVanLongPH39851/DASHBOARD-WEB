const NoData = ({height='auto'}) => (
  <div className='w-full flex justify-center items-center text-xl text-color-black-70 font-medium' style={{height: typeof height === 'number' ? `${height}px` : height}}>
    No data
  </div>
);

export default NoData;