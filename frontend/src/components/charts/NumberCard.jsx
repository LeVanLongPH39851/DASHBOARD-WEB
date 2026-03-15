import Loading from '../commons/Loading';
import NameChart from '../layouts/components/NameChart';
const NumberCard = ({ title, description, value, icon=false, background, height='', widthIcon='', suffix = '' }) => {
  if(value==='isLoading') {
    return (
      <div className={`p-6 ${height} bg-background-light border border-border-black-10 rounded-2xl shadow-component`}>
        <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} />
        <Loading />
      </div>
    );
  }
  return (
    <div className={`p-6 ${height} bg-background-light border border-border-black-10 rounded-2xl shadow-component`}>
      <NameChart nameChart={title} description={description} icon={icon} width={widthIcon} backgound={background} />
        <p className="text-color-black-100 text-[32px] font-semibold">
          {value?.toLocaleString()} {suffix}
        </p>
    </div>
  );
};

export default NumberCard;