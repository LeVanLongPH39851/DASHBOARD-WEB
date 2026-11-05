import logoVTVRatings from "../assets/logo_VTVRating_white.png";
import Footer from "../components/layouts/footers/Footer";
import iconHideEye from "../assets/icon_hide_eye.png";
import iconBlockEye from "../assets/icon_block_eye.png";
import bannerBackGroundLogin from "../assets/banner_background_login.png";
import tabOverview from "../assets/tab_overview.png";
import tabOverviewDark from "../assets/tab_overview_dark.png";
import tabChannel from "../assets/tab_channel.png";
import tabChannelDark from "../assets/tab_channel_dark.png";
import tabProgram from "../assets/tab_program.png";
import tabRatingByMinute from "../assets/tab_rating_by_minute.png";
import bannerImageVietNam from "../assets/banner_map_viet_nam.png";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import {
  getDashboards,
  login,
  resendOtp,
  verifyOtp,
} from "../services/authService";

const Login = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: false,
  };

  const [type, setType] = useState(true);
  const leftSectionRef = useRef(null);
  const rightSectionRef = useRef(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorName, setErrorName] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [showErrorName, setShowErrorName] = useState(false);
  const [showErrorPass, setShowErrorPass] = useState(false);
  const [showErrorLogin, setShowErrorLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpChallengeId, setOtpChallengeId] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const navigate = useNavigate(); // ← Hook navigate

  const redirectAfterLogin = async () => {
    try {
      const dashRes = await getDashboards();
      const mapped = dashRes?.dashboards || [];
      if (mapped.length === 1) {
        navigate(mapped[0].path, { replace: true });
        return;
      }
    } catch {
      // Nếu lỗi thì chuyển về trang danh sách /dashboard
    }
    navigate("/dashboard", { replace: true });
  };

  useEffect(() => {
    // Trigger animation khi load
    if (leftSectionRef.current) {
      leftSectionRef.current.classList.add("animate-slide-left");
    }
    if (rightSectionRef.current) {
      rightSectionRef.current.classList.add("animate-slide-right");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setShowErrorName(false);
    setShowErrorPass(false);
    setShowErrorLogin(false);

    // Giữ hiệu ứng chờ 700ms nếu bạn muốn
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Validate username
    if (!username.trim()) {
      setErrorName("Vui lòng nhập tài khoản");
      setShowErrorName(true);
    }

    // Validate password
    if (!password) {
      setErrorPass("Vui lòng nhập mật khẩu");
      setShowErrorPass(true);
    }

    if (!password || !username.trim()) {
      return;
    }

    try {
      setLoading(true);

      // Gọi API Gateway
      const result = await login(username.trim(), password);

      console.log("[LOGIN RESPONSE]", result);

      if (result.status === "success") {
        await redirectAfterLogin();
        return;
      }

      if (result.status === "otp_required") {
        const challengeId = result.data?.challengeId;

        if (!challengeId) {
          throw new Error("Không nhận được challengeId từ API Gateway");
        }

        setOtpChallengeId(challengeId);
        setOtpEmail(result.data?.email || "");
        setOtp("");
        setOtpError("");
        setOtpMessage("");

        return;
      }

      throw new Error(result.message || "Phản hồi đăng nhập không hợp lệ");
    } catch (error) {
      console.error("[LOGIN ERROR]", error);

      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

      if (status === 401 || status === 403 || status === 500) {
        setErrorLogin("Tài khoản hoặc mật khẩu không chính xác");
        setShowErrorLogin(true);
      } else {
        setErrorLogin(message);
        setShowErrorLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Vui lòng nhập mã OTP gồm 6 chữ số");
      return;
    }

    try {
      setVerifyingOtp(true);
      const result = await verifyOtp(otpChallengeId, otp);

      if (result.status !== "success") {
        throw new Error(result.message || "Không thể xác thực mã OTP");
      }

      await redirectAfterLogin();
    } catch (error) {
      setOtpError(
        error.status == 500
          ? "Mã OTP không chính xác"
          : error.response?.data?.message ||
              error.message ||
              "Xác thực OTP thất bại. Vui lòng thử lại.",
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError("");
    setOtpMessage("");

    try {
      setResendingOtp(true);
      const result = await resendOtp(otpChallengeId);

      if (!result.success) {
        throw new Error(result.message || "Không thể gửi lại mã OTP");
      }

      setOtp("");
      setOtpMessage(result.message || "Mã OTP mới đã được gửi đến email.");
    } catch (error) {
      setOtpError(
        error.status == 500
          ? "Gửi lại mã OTP thất bại"
          : error.response?.data?.message ||
              error.message ||
              "Gửi lại mã OTP thất bại. Vui lòng thử lại.",
      );
    } finally {
      setResendingOtp(false);
    }
  };

  const closeOtpModal = () => {
    setOtpChallengeId("");
    setOtp("");
    setOtpError("");
    setOtpMessage("");
  };

  return (
    <main className="p-7.5 flex h-lvh tracking-[0.1px] overflow-hidden font-family-be-vietnam-pro">
      <section
        ref={leftSectionRef}
        className="flex flex-col justify-between w-1/2 section-left"
      >
        <div>
          <figure>
            <img
              src={logoVTVRatings}
              className="w-43.25"
              alt="Logo VTVRatings"
            />
          </figure>
        </div>
        <div className="flex justify-center">
          <div>
            <div className="text-center">
              <h2 className="text-color-black-100 font-semibold text-[32px] mb-6">
                Xin chào
              </h2>
              <p className="text-color-p-login text-sm font-normal mb-16.75">
                Vui lòng điền thông tin đăng nhập
              </p>
            </div>
            <div className="w-122.5">
              <p className="text-color-footer text-sm font-normal mb-1">
                Hoặc sử dụng tài khoản công khai
              </p>
              <p className="text-sm font-normal text-color-p-login">
                Tên tài khoản:{" "}
                <span className="text-color-p-black-login">vtvguest</span>
              </p>
              <p className="text-sm font-normal text-color-p-login mb-8.75">
                Mật khẩu:{" "}
                <span className="text-color-p-black-login">guest@neotam</span>
              </p>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col mb-5.5 relative">
                  <label className="mb-2 text-color-p-login text-sm font-normal">
                    Tài khoản
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    className={`w-full py-3 px-4 rounded-[10px] border ${showErrorName ? "border-color-error" : "border-background-line-gray"} outline-none transition-all duration-700 placeholder:text-color-p-login text-base placeholder:font-normal placeholder:text-sm text-color-p-black-login font-medium`}
                    placeholder="Nhập tài khoản ..."
                  />
                  <p
                    className={`${showErrorName ? "w-full opacity-100 visible" : "w-0 opacity-0 invisible"} text-nowrap overflow-hidden text-color-error transition-all duration-700 font-normal text-sm absolute left-0 bottom-0 translate-y-full`}
                  >
                    {errorName}
                  </p>
                </div>
                <div className="flex flex-col mb-5.5">
                  <label className="mb-2 text-color-p-login text-sm font-normal">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={type ? "password" : "text"}
                      className={`w-full py-3 px-4 rounded-[10px] border ${showErrorPass ? "border-color-error" : "border-background-line-gray"} outline-none transition-all duration-700 placeholder:text-color-p-login text-base placeholder:font-normal placeholder:text-sm text-color-p-black-login font-medium`}
                      placeholder="Nhập mật khẩu ..."
                    />
                    <p
                      className={`${showErrorPass ? "w-full opacity-100 visible" : "w-0 opacity-0 invisible"} text-nowrap overflow-hidden text-color-error transition-all duration-700 font-normal text-sm absolute left-0 bottom-0 translate-y-full`}
                    >
                      {errorPass}
                    </p>
                    <figure
                      onClick={() => {
                        setType(!type);
                      }}
                      className="cursor-pointer"
                    >
                      <img
                        src={type ? iconHideEye : iconBlockEye}
                        className="w-4.25 absolute top-1/2 -translate-y-1/2 right-4"
                        alt="Icon Hide Eye"
                      />
                    </figure>
                  </div>
                </div>
                {/* <div className="flex justify-between mb-8">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-1.5" />
                    <span className="text-color-p-login text-sm font-normal">
                      Remember me
                    </span>
                  </div>
                  <p className="cursor-pointer text-sm text-color-p-black-login font-normal">
                    Forgot password ?
                  </p>
                </div> */}
                <div className="mb-2">
                  {!errorLogin && (
                    <p className="text-color-error font-normal text-sm opacity-0">
                      Sai tài khoản hoặc mật khẩu
                    </p>
                  )}
                  <p
                    className={`${showErrorLogin ? "w-full opacity-100 visible" : "w-0 opacity-0 invisible"} text-nowrap overflow-hidden text-color-error transition-all duration-700 font-normal text-sm`}
                  >
                    {errorLogin}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer w-full h-12 flex justify-center items-center hover:opacity-90 bg-color-p-black-login text-base text-color-white-90 font-medium rounded-[10px] disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-300"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div>
          <Footer color="text-color-footer" />
        </div>
      </section>
      <section
        ref={rightSectionRef}
        style={{ backgroundImage: `url(${bannerBackGroundLogin})` }}
        className="w-1/2 rounded-2xl bg-cover bg-center bg-no-repeat relative flex flex-col justify-center items-center section-right"
      >
        <div className="mb-19.5 relative z-10">
          <h1 className="text-color-p-black-login text-[38px] font-semibold mb-4">
            Kết nối dễ dàng cho tất cả
          </h1>
          <p className="max-w-129.5 text-color-p-black-login text-sm font-normal">
            Mang AI đến cho tất cả mọi người — bất kể trình độ kỹ thuật, mọi
            người đều có thể sử dụng AI hiệu quả trong công việc và cuộc sống.
          </p>
        </div>
        <figure className="w-[70%] relative z-10 border-[9px] rounded-[11px] border-color-p-black-login bg-color-p-black-login">
          <Slider {...settings}>
            <img
              src={tabOverview}
              className="w-full rounded-lg cursor-grab active:cursor-grabbing select-none"
              alt="Banner Image"
            />
            <img
              src={tabOverviewDark}
              className="w-full rounded-lg cursor-grab active:cursor-grabbing select-none"
              alt="Banner Image"
            />
            <img
              src={tabChannel}
              className="w-full rounded-lg cursor-grab active:cursor-grabbing select-none"
              alt="Banner Image"
            />
            <img
              src={tabChannelDark}
              className="w-full rounded-lg cursor-grab active:cursor-grabbing select-none"
              alt="Banner Image"
            />
            <img
              src={tabProgram}
              className="w-full rounded-lg cursor-grab active:cursor-grabbing select-none"
              alt="Banner Image"
            />
            <img
              src={tabRatingByMinute}
              className="w-full rounded-lg cursor-grab active:cursor-grabbing select-none"
              alt="Banner Image"
            />
          </Slider>
        </figure>
        <figure className="absolute top-1/2 -translate-y-1/2 right-0 h-[90%]">
          <img
            src={bannerImageVietNam}
            className="h-full"
            alt="Banner Image Viet Nam"
          />
        </figure>
      </section>
      <div
        className={`fixed inset-0 bottom-auto ${otpChallengeId ? "top-0 bottom-0" : "-top-full"} z-50 flex items-center justify-center bg-black/50 px-4 py-6 w-full h-full transition-all duration-300`}
        role="presentation"
      >
        <section
          aria-labelledby="otp-modal-title"
          aria-modal="true"
          className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9"
          role="dialog"
        >
          <div className="mb-7 text-center">
            <h2
              id="otp-modal-title"
              className="mb-2 text-2xl font-semibold text-color-p-black-login"
            >
              Xác thực email
            </h2>
            <p className="text-sm leading-6 text-color-p-login">
              Nhập mã OTP gồm 6 chữ số đã gửi đến{" "}
              <span className="font-medium text-color-p-black-login">
                {otpEmail || "email của bạn"}
              </span>
              .
            </p>
          </div>

          <form onSubmit={handleVerifyOtp}>
            <label
              className="mb-2 block text-sm font-medium text-color-p-black-login"
              htmlFor="otp-code"
            >
              Mã xác thực
            </label>
            <input
              autoComplete="one-time-code"
              autoFocus
              className={`w-full rounded-[10px] border px-4 py-3 text-center text-xl font-semibold tracking-[0.35em] text-color-p-black-login outline-none transition focus:border-color-primary-700 ${
                otpError ? "border-color-error" : "border-background-line-gray"
              }`}
              id="otp-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError("");
                setOtpMessage("");
              }}
              pattern="[0-9]{6}"
              placeholder="••••••"
              required
              type="text"
              value={otp}
            />

            {otpError && (
              <p className="mt-2 text-sm text-color-error" role="alert">
                {otpError}
              </p>
            )}
            {otpMessage && (
              <p
                className="mt-2 text-sm text-color-succes-type-1"
                role="status"
              >
                {otpMessage}
              </p>
            )}

            <button
              className="mt-6 flex h-12 w-full items-center justify-center rounded-[10px] bg-color-p-black-login text-base font-medium text-color-white-90 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-all duration-300"
              disabled={verifyingOtp || resendingOtp}
              type="submit"
            >
              {verifyingOtp ? "Đang xác thực..." : "Xác nhận"}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-1 text-sm">
            <span className="text-color-p-login">Chưa nhận được mã?</span>
            <button
              className="font-medium text-color-primary-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition-all duration-300"
              disabled={resendingOtp || verifyingOtp}
              onClick={handleResendOtp}
              type="button"
            >
              {resendingOtp ? "Đang gửi..." : "Gửi lại mã"}
            </button>
          </div>

          <button
            className="mt-5 w-full text-sm font-medium text-color-p-login hover:text-color-p-black-login cursor-pointer transition-all duration-300"
            onClick={closeOtpModal}
            type="button"
          >
            Quay lại đăng nhập
          </button>
        </section>
      </div>
    </main>
  );
};

export default Login;
