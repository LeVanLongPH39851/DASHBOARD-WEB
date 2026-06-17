import './Loading.css'
const Loading = ({ height = 'auto' }) => (
  <div className='w-full flex justify-center items-center' style={{ height: typeof height === 'number' ? `${height}px` : height }}>
    <div className="loading-wave" style={{ height: height == 'auto' ? '70px' : '' }}>
      <div className="loading-bar bg-color-neotam dark:bg-background-primary transition-all duration-300"></div>
      <div className="loading-bar bg-color-neotam dark:bg-background-primary transition-all duration-300"></div>
      <div className="loading-bar bg-color-neotam dark:bg-background-primary transition-all duration-300"></div>
      <div className="loading-bar bg-color-neotam dark:bg-background-primary transition-all duration-300"></div>
    </div>
  </div>
);

export default Loading;