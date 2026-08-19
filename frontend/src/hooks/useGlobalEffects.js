import { useEffect } from "react";
import { useDarkMode, useScreenLg, useScreenMd, useIsOpen } from "../context/DashboardFilterContext";
import { generateRandomId } from "../helpers/helper";

export default function useGlobalEffects() {
  const { value: darkMode, setValue: setDarkMode } = useDarkMode();
  const { value: screenLg, setValue: setScreenLg } = useScreenLg();
  const { value: screenMd, setValue: setScreenMd } = useScreenMd();
  const { value: isOpen, setValue: setIsOpen } = useIsOpen();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme && savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const existingUserId = sessionStorage.getItem("user_id");
    const controller = new AbortController();
    const newUserId = generateRandomId(6);
    sessionStorage.setItem("user_id", newUserId);

    // Gọi endpoint Doris với session cũ trước khi reset session mới
    if (existingUserId) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/doris/processlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: existingUserId }),
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log('✅ Doris PROCESSLIST:', data);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.error("❌ Lỗi gọi Doris:", err);
        });

      // Kill tất cả Superset request đang pending của user cũ
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/kill-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: existingUserId }),
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log(`✅ Kill Superset requests: ${data.message}`);
          // ✅ Báo cho tất cả useApi hooks reset loading về false
          // window.dispatchEvent(new CustomEvent('api-killed'));
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.error("❌ Lỗi gọi kill-user:", err);
        });
    }

    return () => controller.abort();
  }, []);

  // ✅ Thêm event listener khi tắt trình duyệt/tab để kill các request
  useEffect(() => {
    const handleUnload = () => {
      const userId = sessionStorage.getItem("user_id");
      if (userId) {
        // Kill Doris
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/doris/processlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
          keepalive: true,
        }).catch(() => {});

        // Kill Superset
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/kill-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    let timeoutId;

    const checkMobile = () => {
      // ✅ Cancel timeout cũ
      clearTimeout(timeoutId);

      // ✅ Debounce manual 150ms
      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 1025;
        const isLaptop = window.innerWidth < 1707;
        setIsOpen(!isMobile);
        setScreenMd(isMobile);
        setScreenLg(isLaptop);
      }, 150);
    };

    // ✅ Initial check ngay lập tức
    checkMobile();

    // ✅ Listen resize
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeoutId); // ✅ Cleanup timeout
    };
  }, []);
}