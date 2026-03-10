import './Loading.css'
const Loading = () => (
  <div className='w-full h-full fixed top-0 left-0 flex justify-center items-center'>
    <div class="loading-wave">
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
      <div class="loading-bar"></div>
    </div>
  </div>
);

export default Loading;