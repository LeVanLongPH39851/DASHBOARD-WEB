import { useEffect, useState } from "react";
import { getMe } from "../services/authService";

// Biến Singleton lưu cache trong bộ nhớ (Module-level cache)
let cachedUser = null;
let cachedError = null;
let isFetched = false;
let fetchPromise = null;

// Danh sách các component đang lắng nghe thay đổi
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * Gọi getMe() đúng 1 lần duy nhất trong toàn bộ vòng đời ứng dụng.
 * Dù nhiều component gọi cùng một lúc hoặc rerender liên tục,
 * chỉ có duy nhất 1 request HTTP được gửi đi.
 */
function fetchCurrentUser(force = false) {
  if (isFetched && !force) {
    return Promise.resolve(cachedUser);
  }

  if (fetchPromise && !force) {
    return fetchPromise;
  }

  fetchPromise = getMe()
    .then((res) => {
      // Chuẩn hóa dữ liệu trả về từ getMe()
      const userData = res?.user || res?.result || res || null;
      if (userData) {
        cachedUser = {
          ...userData,
          // Đảm bảo tương thích nếu component truy cập trực tiếp user.id, user.first_name thay vì user.profile
          id: userData.profile?.id ?? userData.id,
          first_name: userData.profile?.first_name ?? userData.first_name,
          last_name: userData.profile?.last_name ?? userData.last_name,
          email: userData.profile?.email ?? userData.email,
        };
      } else {
        cachedUser = null;
      }
      cachedError = null;
      isFetched = true;
      return cachedUser;
    })
    .catch((err) => {
      cachedUser = null;
      cachedError = err;
      isFetched = true;
      throw err;
    })
    .finally(() => {
      fetchPromise = null;
      notifyListeners();
    });

  return fetchPromise;
}

/**
 * Hook useCurrentUser:
 * - Trả về: { user, userLoading, error, refetch }
 * - Đảm bảo chỉ gọi getMe() đúng 1 lần duy nhất
 * - Bất kể component có re-render bao nhiêu lần cũng không gọi lại API
 */
export function useCurrentUser() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Đăng ký listener để cập nhật state khi fetch xong
    const handleChange = () => setTick((t) => t + 1);
    listeners.add(handleChange);

    // Kích hoạt gọi getMe() nếu chưa từng fetch
    if (!isFetched && !fetchPromise) {
      fetchCurrentUser();
    }

    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return {
    user: cachedUser,
    userLoading: !isFetched,
    error: cachedError,
    refetch: () => fetchCurrentUser(true),
  };
}

/**
 * Xóa cache người dùng hiện tại (gọi khi đăng xuất)
 */
export function clearCurrentUserCache() {
  cachedUser = null;
  cachedError = null;
  isFetched = false;
  fetchPromise = null;
  notifyListeners();
}

export default useCurrentUser;
