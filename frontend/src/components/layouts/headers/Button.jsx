const Button = ({background, color, src, widthImage='', heightImage='', alt='', rotate='', text='', src2=false, widthImage2='', heightImage2='', alt2='', rotate2='', click=undefined, type='button'}) => {
    return (
        <button onClick={click} type={type} className={`px-4 py-2 rounded-xl ${background} flex items-center gap-1 cursor-pointer`}>
            <figure><img src={src} className={`${widthImage} ${heightImage} ${rotate}`} alt={alt} /></figure>
            {text!='' && (<span className={`text-sm text-nowrap font-medium ${color}`}>{text}</span>)}
            {src2 && (<figure><img src={src2} className={`${widthImage2} ${heightImage2} ${rotate2}`} alt={alt2} /></figure>)}
        </button>
    );
};

export default Button;