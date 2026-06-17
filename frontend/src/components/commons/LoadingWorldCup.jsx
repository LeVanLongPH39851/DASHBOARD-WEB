import './LoadingWorldCup.css'
const LoadingWorldCup = ({ height = 'auto', text = 'WORLD CUP 2026' }) => (
    <div className='w-full flex justify-center items-center' style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <div id="page">
            <div id="container">
                <div id="ring"></div>
                <div id="ring"></div>
                <div id="ring"></div>
                <div id="ring"></div>
                <div id="h3" className='font-bold transition-all duration-300 text-base max-lg:text-sm max-md:text-xs text-color-black-100 dark:text-white'>{text}</div>
            </div>
        </div>
    </div>
);

export default LoadingWorldCup;