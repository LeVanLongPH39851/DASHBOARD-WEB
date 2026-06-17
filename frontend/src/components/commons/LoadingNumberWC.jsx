import './LoadingNumberWC.css'
const LoadingNumberWC = ({ height = 'auto' }) => (
    <div className='w-full flex justify-center items-center' style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <div className="loader">
            <div className="layer text-2xl max-lg:text-xl max-md:text-base">World cup 2026</div>
            <div className="layer text-2xl max-lg:text-xl max-md:text-base">World cup 2026</div>
        </div>

    </div>
);

export default LoadingNumberWC;