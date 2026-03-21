import logoVTVRatings from '../assets/logo_vtvratings.png';
import Footer from '../components/layouts/footers/Footer';
import iconHideEye from '../assets/icon_hide_eye.png';
import iconBlockEye from '../assets/icon_block_eye.png';
import bannerBackGroundLogin from '../assets/banner_background_login.png';
import bannerIamgeLogin from '../assets/banner_image_login.png';
import bannerImageVietNam from '../assets/banner_map_viet_nam.png';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const [ type, setType ] = useState(true);
    const leftSectionRef = useRef(null);
    const rightSectionRef = useRef(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorName, setErrorName] = useState('');
    const [errorPass, setErrorPass] = useState('');
    const [showErrorName, setShowErrorName] = useState(false);
    const [showErrorPass, setShowErrorPass] = useState(false);
    const navigate = useNavigate(); // ← Hook navigate

    useEffect(() => {
        // Trigger animation khi load
        if (leftSectionRef.current) {
        leftSectionRef.current.classList.add('animate-slide-left');
        }
        if (rightSectionRef.current) {
        rightSectionRef.current.classList.add('animate-slide-right');
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        setShowErrorName(false);
        setShowErrorPass(false);
        setTimeout(() => {
            // ✅ Hardcode check (production dùng API)
            if (username === 'vtvguest' && password === 'guest@neotam') {
            // Lưu token/session (sessionStorage)
            sessionStorage.setItem('userToken', 'vtv-user-logged-in');
            sessionStorage.setItem('username', 'vtvguest');
            
            // Redirect Dashboard
            navigate('/dashboard', { replace: true });
            } else {
                if (username.length == 0) {
                    setErrorName('Vui lòng nhập tài khoản');
                    setShowErrorName(true);
                } else if(username !== 'vtvguest') {
                    setErrorName('Tài khoản không chính xác');
                    setShowErrorName(true);
                } else {
                    setErrorName('');
                    setShowErrorName(false);
                }

                if (password.length == 0) {
                    setErrorPass('Vui lòng nhập mật khẩu');
                    setShowErrorPass(true);
                } else if (password !== 'guest@neotam') {
                    setErrorPass('Mật khẩu không chính xác');
                    setShowErrorPass(true);
                } else {
                    setErrorPass('');
                    setShowErrorPass(false);
                }
            }
        }, 700)
    }

  return (
    <main className="p-7.5 flex h-lvh tracking-[0.1px] overflow-hidden">
        <section ref={leftSectionRef} className='flex flex-col justify-between w-1/2 section-left'>
            <div>
                <figure><img src={logoVTVRatings} className='w-43.25' alt="Logo VTVRatings" /></figure>
            </div>
            <div className='flex justify-center'>
                <div>
                    <div className='text-center'>
                        <h2 className='text-color-black-100 font-semibold text-[32px] mb-6'>
                            Xin chào
                        </h2>
                        <p className='text-color-p-login text-sm font-normal mb-16.75'>Vui lòng điền thông tin đăng nhập</p>
                    </div>
                    <div className='w-122.5'>
                        <p className='text-color-footer text-sm font-normal mb-1'>Hoặc sử dụng tài khoản công khai</p>
                        <p className='text-sm font-normal text-color-p-login'>
                            Tên tài khoản: <span className='text-color-p-black-login'>vtvguest</span>
                        </p>
                        <p className='text-sm font-normal text-color-p-login mb-8.75'>
                            Mật khẩu: <span className='text-color-p-black-login'>guest@neotam</span>
                        </p>
                        <form onSubmit={handleLogin}>
                            <div className='flex flex-col mb-5.5 relative'>
                                <label className='mb-2 text-color-p-login text-sm font-normal'>Tài khoản</label>
                                <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" className={`w-full py-3 px-4 rounded-[10px] border ${showErrorName ? 'border-color-error' : 'border-background-line-gray'} outline-none transition-all duration-700 placeholder:text-color-p-login text-base placeholder:font-normal placeholder:text-sm text-color-p-black-login font-medium`} placeholder='Nhập tài khoản ...' />
                                <p className={`${showErrorName ? 'w-full opacity-100 visible' : 'w-0 opacity-0 invisible'} text-nowrap overflow-hidden text-color-error transition-all duration-700 font-normal text-sm absolute left-0 bottom-0 translate-y-full`}>{errorName}</p>
                            </div>
                            <div className='flex flex-col mb-5.5'>
                                <label className='mb-2 text-color-p-login text-sm font-normal'>Mật khẩu</label>
                                <div className='relative'>
                                    <input value={password} onChange={(e) => setPassword(e.target.value)} type={type ? 'password' : 'text'} className={`w-full py-3 px-4 rounded-[10px] border ${showErrorPass ? 'border-color-error' : 'border-background-line-gray'} outline-none transition-all duration-700 placeholder:text-color-p-login text-base placeholder:font-normal placeholder:text-sm text-color-p-black-login font-medium`} placeholder='Nhập mật khẩu ...' />
                                    <p className={`${showErrorPass ? 'w-full opacity-100 visible' : 'w-0 opacity-0 invisible'} text-nowrap overflow-hidden text-color-error transition-all duration-700 font-normal text-sm absolute left-0 bottom-0 translate-y-full`}>{errorPass}</p>
                                    <figure onClick={() => { setType(!type) }} className='cursor-pointer'><img src={type ? iconHideEye : iconBlockEye} className='w-4.25 absolute top-1/2 -translate-y-1/2 right-4' alt="Icon Hide Eye" /></figure>
                                </div>
                            </div>
                            <div className='flex justify-between mb-8'>
                                <div className='flex items-center'><input type="checkbox" className='mr-1.5' /><span className='text-color-p-login text-sm font-normal'>Remember me</span></div>
                                <p className='cursor-pointer text-sm text-color-p-black-login font-normal'>Forgot password ?</p>
                            </div>
                            <button type='submit' className='cursor-pointer w-full h-12 flex justify-center items-center bg-color-p-black-login text-base text-color-white-90 font-medium rounded-[10px]'>Đăng nhập</button>
                        </form>
                    </div>
                </div>
            </div>
            <div>
                <Footer color='text-color-footer' />
            </div>
        </section>
        <section ref={rightSectionRef} style={{ backgroundImage: `url(${bannerBackGroundLogin})` }} className='w-1/2 rounded-2xl bg-cover bg-center bg-no-repeat relative flex flex-col justify-center items-center section-right'>
            <div className='mb-19.5 relative z-10'>
                <h1 className='text-color-p-black-login text-[38px] font-semibold mb-4'>Kết nối dễ dàng cho tất cả</h1>
                <p className='max-w-129.5 text-color-p-black-login text-sm font-normal'>Mang AI đến cho tất cả mọi người — bất kể trình độ kỹ thuật, mọi người đều có thể sử dụng AI hiệu quả trong công việc và cuộc sống.</p>
            </div>
            <figure className='w-[70%] relative z-10'>
                <img src={bannerIamgeLogin} className='w-full' alt="Banner Image Login" />
            </figure>
            <figure className='absolute top-1/2 -translate-y-1/2 right-0 h-[90%]'><img src={bannerImageVietNam} className='h-full' alt="Banner Image Viet Nam" /></figure>
        </section>
    </main>
  );
};

export default Login;