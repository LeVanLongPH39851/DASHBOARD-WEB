import IconInfor from './IconInfor';
const NameChart = ({ nameChart, description }) => {
  return (
    <div className='p-6 text-2xl font-bold tracking-[-4%] leading-[100%] text-color-dark flex items-center'>
        <span>{nameChart}</span><IconInfor description={description} />
      </div>
  );
};

export default NameChart;