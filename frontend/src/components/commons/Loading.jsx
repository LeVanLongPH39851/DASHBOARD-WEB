import './Loading.css'
const Loading = ({ height = 'auto' }) => (
  <div className={`w-full flex justify-center items-center ${height == 'auto' ? 'flex-1' : ''}`} style={{ height: typeof height === 'number' ? `${height}px` : height }}>
    <div className={`loading-wave ${height == 'auto' ? 'h-12.5 max-lg:h-10 max-md:h-7.5' : 'h-25 max-lg:h-18.75 max-md:h-12.5'}`}>
      <div className={`loading-bar ${height == 'auto' ? 'auto' : ''} bg-color-neotam dark:bg-background-primary transition-all duration-300`}></div>
      <div className={`loading-bar ${height == 'auto' ? 'auto' : ''} bg-color-neotam dark:bg-background-primary transition-all duration-300`}></div>
      <div className={`loading-bar ${height == 'auto' ? 'auto' : ''} bg-color-neotam dark:bg-background-primary transition-all duration-300`}></div>
      <div className={`loading-bar ${height == 'auto' ? 'auto' : ''} bg-color-neotam dark:bg-background-primary transition-all duration-300`}></div>
    </div>
  </div>
);

export default Loading;