import './Loading.css'
const Loading = ({height='auto'}) => (
  <div className='w-full flex justify-center items-center' style={{height: typeof height === 'number' ? `${height}px` : height}}>
    <div class="loading-wave" style={{height: height=='auto' ? '78px' : ''}}>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  </div>
);

export default Loading;