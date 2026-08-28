import iconHome from "../../../assets/icon_home.png";
import iconHomeDark from "../../../assets/icon_home_dark.png";
import iconArrowRight from "../../../assets/icon_arrow_right.png";
import iconDisplay from "../../../assets/icon_display.png";
import iconInstruct from "../../../assets/icon_instruct.png";
import iconSucces from "../../../assets/icon_succes.png";
import iconDownload from "../../../assets/icon_download.png";
import iconDisplayDark from "../../../assets/icon_display_dark.png";
import iconInstructDark from "../../../assets/icon_instruct_dark.png";
import iconDownloadDark from "../../../assets/icon_download_dark_mode.png";
import Button from "./Button";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useDarkMode,
  useCurrentTab,
  useScreenMd,
} from "../../../context/DashboardFilterContext";
import iconPDF from "../../../assets/icon_pdf.png";
import iconIMG from "../../../assets/icon_img.png";
import iconList from "../../../assets/icon_list.png";
import iconArrowLeft2 from "../../../assets/icon_arrow_left_2.png";
import iconListDark from "../../../assets/icon_list_dark.png";
import iconArrowLeft2Dark from "../../../assets/icon_arrow_left_2_dark.png";
import { CUSTOM_CHART } from "../../../utils/customChart";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import {
  handleCapture,
  handlePDF,
  handleCaptureFireFox,
  handlePDFFireFox,
} from "../../../helpers/helper";

const BreadCrumb = ({
  dashboardName = "Kênh truyền hình VTV",
  icon = false,
  widthIcon = "",
}) => {
  // console.log("BreadCrumb");

  const { value: darkMode, setValue: setDarkMode } = useDarkMode();
  const { value: currentTab, setValue: setCurrentTab } = useCurrentTab();
  const { value: screenMd, setValue: setScreenMd } = useScreenMd();
  const { user, userLoading } = useCurrentUser();

  const isFirefox = /firefox/i.test(navigator.userAgent);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ ESC key close
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleToggle = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  return (
    <nav
      id="BreadCrumb"
      className="px-6 max-lg:px-5 max-md:px-4 bg-background-light dark:bg-background-dark border-b border-border-black-10 dark:border-transparent transition-all duration-300 pt-2 pb-1 sticky top-0"
      style={{ zIndex: 300 }}
    >
      {/* <div className='flex items-center gap-2 max-lg:gap-1 max-md:hidden'>
            <figure><img src={!darkMode ? iconHome : iconHomeDark} className='w-3 max-lg:w-2.5 h-3 max-lg:h-2.5' alt="Icon Home" /></figure>
                <span className='text-sm max-lg:text-[13px] font-normal text-color-black-50 dark:text-color-white-50 transition-all duration-300'>
                    <a href={`${CUSTOM_CHART.domain}/superset/welcome/`}>Trang chủ</a>
                </span>
            <figure><img src={iconArrowRight} className='h-2.75 max-lg:h-2.5' alt="Icon Arrow Right" /></figure>
            <span className='text-sm max-lg:text-[13px] font-medium text-color-black-100 dark:text-color-white-90 transition-all duration-300 uppercase'>{dashboardName}</span>
        </div> */}
      <div className="pt-2 flex justify-between items-center">
        <div className="flex items-center">
          <a href={`${CUSTOM_CHART.domain}/superset/welcome/`}>
            <figure className="cursor-pointer p-2 pl-0 mr-2 hidden max-md:block">
              <img
                src={!darkMode ? iconArrowLeft2 : iconArrowLeft2Dark}
                className="w-3.5"
                alt="Icon Arrow Left 2"
              />
            </figure>
          </a>
          {icon && (
            <figure className="mr-1">
              <img
                src={icon}
                className={`${widthIcon}`}
                alt="Icon BreadCrumb"
              />
            </figure>
          )}
          <h1 className="text-[32px] max-lg:text-2xl max-md:text-lg font-semibold text-color-black-100 dark:text-color-white-90 transition-all duration-300 uppercase">
            {dashboardName}
          </h1>
        </div>
        <div className="flex items-center gap-4 max-md:hidden">
          {/* <Button background={'bg-background-black-4 dark:bg-background-white-15'} color={'text-color-black-100 dark:text-color-white-80'} src={!darkMode ? iconDisplay : iconDisplayDark}
                            widthImage='w-3.75' heightImage='h-3.75' alt='Icon Display' text={'Quản lý hiển thị'} /> */}
          <a href="https://ratings.vtv.vn/huongdan/" target="_blank">
            <Button
              background={"bg-background-black-4 dark:bg-background-white-15"}
              color={"text-color-black-100 dark:text-color-white-80"}
              src={!darkMode ? iconInstruct : iconInstructDark}
              widthImage="w-4 max-lg:w-3.5"
              heightImage="h-4 max-lg:h-3.5"
              alt="Icon Instruct"
              text={"Hướng dẫn"}
              src2={iconSucces}
              widthImage2="w-3.5 max-lg:w-3"
              alt2="Icon Succes"
            />
          </a>
          {!userLoading && user?.username !== "vtvguest" && (
            <div className="relative">
              <div ref={!screenMd ? buttonRef : undefined}>
                <Button
                  background={"bg-color-black-100 dark:bg-background-primary"}
                  color={"text-color-white-90 dark:text-color-black-100"}
                  src={!darkMode ? iconDownload : iconDownloadDark}
                  widthImage="w-3.5 max-lg:w-3"
                  heightImage="h-3.5 max-lg:h-3"
                  alt="Icon Download"
                  text={"Tải xuống"}
                  click={handleToggle}
                />
              </div>
              <div
                ref={!screenMd ? dropdownRef : undefined}
                className={`${isDropdownOpen ? "scale-100 opacity-100 origin-top" : "scale-0 opacity-0 origin-top"} transition-all duration-300 absolute top-full left-0 bg-background-light dark:bg-background-dark flex flex-col border border-border-black-10 dark:border-background-white-15 rounded-xl w-full overflow-hidden`}
              >
                <div
                  onClick={() =>
                    !isFirefox
                      ? handleCapture(currentTab)
                      : handleCaptureFireFox(currentTab)
                  }
                  className="hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300"
                >
                  <Button
                    background={"bg-transparent"}
                    color={"text-color-black-100 dark:text-color-white-80"}
                    src={iconIMG}
                    widthImage="w-4 max-lg:w-3.75"
                    alt="Icon Instruct"
                    text={"Tải Ảnh"}
                  />
                </div>
                <div
                  onClick={() =>
                    !isFirefox
                      ? handlePDF(currentTab)
                      : handlePDFFireFox(currentTab)
                  }
                  className="hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300"
                >
                  <Button
                    background={"bg-transparent"}
                    color={"text-color-black-100 dark:text-color-white-80"}
                    src={iconPDF}
                    widthImage="w-4 max-lg:w-3.75"
                    alt="Icon Instruct"
                    text={"Tải PDF"}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="hidden max-md:block relative">
          <figure
            ref={screenMd ? buttonRef : undefined}
            className="cursor-pointer p-2"
            onClick={handleToggle}
          >
            <img
              src={!darkMode ? iconList : iconListDark}
              className="w-3.5"
              alt="Icon List"
            />
          </figure>
          <div
            ref={screenMd ? dropdownRef : undefined}
            className={`${isDropdownOpen ? "scale-100 opacity-100 origin-top-right" : "scale-0 opacity-0 origin-top-right"} transition-all duration-300 absolute top-full right-0 bg-background-light dark:bg-background-dark flex flex-col border border-border-black-10 dark:border-background-white-15 rounded-xl w-33.75 overflow-hidden`}
          >
            {/* <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                            <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-80'} src={!darkMode ? iconDisplay : iconDisplayDark}
                            widthImage='w-3.75 max-md:w-3' heightImage='h-3.75 max-md:h-3' alt='Icon Display' text={'Quản lý hiển thị'} />
                        </div> */}
            {!userLoading && user?.username !== "vtvguest" && (
              <div className="hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300">
                <a href="https://ratings.vtv.vn/huongdan/" target="_blank">
                  <Button
                    background={"bg-transparent"}
                    color={"text-color-black-100 dark:text-color-white-80"}
                    src={!darkMode ? iconInstruct : iconInstructDark}
                    widthImage="w-4 max-md:w-3"
                    heightImage="h-4 max-md:h-3"
                    alt="Icon Instruct"
                    text={"Hướng dẫn"}
                    src2={iconSucces}
                    widthImage2="w-3.5 max-md:w-2.5"
                    alt2="Icon Succes"
                  />
                </a>
              </div>
            )}
            {!userLoading && user?.username !== "vtvguest" && (
              <div
                onClick={() =>
                  !isFirefox
                    ? handleCapture(currentTab)
                    : handleCaptureFireFox(currentTab)
                }
                className="hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300"
              >
                <Button
                  background={"bg-transparent"}
                  color={"text-color-black-100 dark:text-color-white-80"}
                  src={iconIMG}
                  widthImage="w-4 max-md:w-3.5"
                  alt="Icon Instruct"
                  text={"Tải Ảnh"}
                />
              </div>
            )}
            <div
              onClick={() =>
                !isFirefox
                  ? handlePDF(currentTab)
                  : handlePDFFireFox(currentTab)
              }
              className="hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300"
            >
              <Button
                background={"bg-transparent"}
                color={"text-color-black-100 dark:text-color-white-80"}
                src={iconPDF}
                widthImage="w-4 max-md:w-3.5"
                alt="Icon Instruct"
                text={"Tải PDF"}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <div className='items-center gap-2 hidden max-md:flex mt-2'>
            <figure><img src={!darkMode ? iconHome : iconHomeDark} className='w-3 h-3 max-md:w-2.5 max-md:h-2.5' alt="Icon Home" /></figure>
                <span className='text-sm max-md:text-xs font-normal text-color-black-50 dark:text-color-white-50 transition-all duration-300'>
                    <a href={`${CUSTOM_CHART.domain}/superset/welcome/`}>Trang chủ</a>
                </span>
            <figure><img src={iconArrowRight} className='h-2.75' alt="Icon Arrow Right" /></figure>
            <span className='text-sm max-md:text-xs font-medium text-color-black-100 dark:text-color-white-90 transition-all duration-300 uppercase'>{dashboardName}</span>
        </div> */}
    </nav>
  );
};

export default React.memo(BreadCrumb);
