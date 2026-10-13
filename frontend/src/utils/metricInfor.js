import iconEye from "../assets/icon_eye.png";
import iconUsers from "../assets/icon_users.png";
import iconVND from "../assets/icon_vnd.png";
import iconDollar from "../assets/icon_dollar.png";
import iconCount from "../assets/icon_count.png";
import iconDuration from "../assets/icon_duration.png";

export const METRICS = {
  rating: {
    name: "ratingNumber",
    metric: "rating",
    title: "Rating (000)",
    description:
      "Số lượng khán giả trung bình mỗi phút đã xem ít nhất một lượt",
    isPercent: false,
    icon: iconEye,
    widthIcon: "w-5.5 max-lg:w-5 max-md:w-4.5",
    color: "text-color-rating",
    background:
      "bg-background-succes-type-2 dark:bg-background-succes-type-2-dark",
    id: "ratingNumberData",
  },
  ave_reach: {
    name: "aveReachNumber",
    metric: "ave_reach",
    title: "Ave.Reach (000)",
    description:
      "Số lượng khán giả (không trùng lặp) trung bình mỗi ngày tính trên dân số từ 4-80 tuổi",
    isPercent: false,
    icon: iconUsers,
    widthIcon: "w-6 max-lg:w-5.5 max-md:w-5",
    color: "text-color-ave-reach",
    background: "bg-background-purple dark:bg-background-purple-dark",
    id: "aveReachNumberData",
  },
  "rating%": {
    name: "ratingPercentNumber",
    metric: "rating%",
    title: "Rating (%)",
    description:
      "Tỉ lệ khán giả trung bình mỗi phút tính trên dân số từ 4-80 tuổi. Rating% cho biết có bao nhiêu phần trăm dân số từ 4-80 tuổi đã xem",
    isPercent: true,
    icon: iconEye,
    widthIcon: "w-5.5 max-lg:w-5 max-md:w-4.5",
    color: "text-color-rating-percent",
    background:
      "bg-background-succes-type-2 dark:bg-background-succes-type-2-dark",
    id: "ratingPercentNumberData",
  },
  "reach%": {
    name: "aveReachPercentNumber",
    metric: "reach%",
    title: "Ave.Reach (%)",
    description:
      "Tỉ lệ khán giả (không trùng lặp) trung bình mỗi ngày tính trên dân số từ 4-80 tuổi",
    isPercent: true,
    icon: iconUsers,
    widthIcon: "w-6 max-lg:w-5.5 max-md:w-5",
    color: "text-color-ave-reach-percent",
    background: "bg-background-purple dark:bg-background-purple-dark",
    id: "aveReachPercentNumberData",
  },
};

export const METRIC_VIETNAMTODAYS = {
  ave_reach: {
    name: "aveReachNumber",
    metric: "ave_reach_1",
    title: "Avg.Reach",
    description: "Trung bình mỗi ngày tiếp cận được bao nhiêu khán giả.",
    isPercent: false,
    icon: iconUsers,
    widthIcon: "w-6 max-lg:w-5.5 max-md:w-5",
    color: "text-color-ave-reach",
    background: "bg-background-purple dark:bg-background-purple-dark",
    id: "aveReachNumberData",
  },
  rating: {
    name: "ratingNumber",
    metric: "Total_Views",
    title: "Total Views",
    description:
      "Tổng số lượt xem hợp lệ trong kỳ (Lượt xem hợp lệ tính khi: Live TV xem tối thiểu từ 30 giây, VOD xem tối thiểu từ 15 giây).",
    isPercent: false,
    icon: iconEye,
    widthIcon: "w-5.5 max-lg:w-5 max-md:w-4.5",
    color: "text-color-rating",
    background:
      "bg-background-succes-type-2 dark:bg-background-succes-type-2-dark",
    id: "ratingNumberData",
  },
  "reach%": {
    name: "aveReachPercentNumber",
    metric: "total_time_viewing",
    title: "Total Watch",
    description: "Tổng thời gian thực tế người dùng xem (Live TV + VOD).",
    isPercent: false,
    icon: iconEye,
    widthIcon: "w-5.5 max-lg:w-5 max-md:w-4.5",
    color: "text-color-rating",
    background:
      "bg-background-succes-type-2 dark:bg-background-succes-type-2-dark",
    id: "aveReachPercentNumberData",
  },
  "rating%": {
    name: "ratingPercentNumber",
    metric: "VOD Consumption",
    title: "VOD Watch",
    description: "Tổng thời gian thực tế người dùng xem VOD.",
    isPercent: false,
    icon: iconEye,
    widthIcon: "w-5.5 max-lg:w-5 max-md:w-4.5",
    color: "text-color-rating",
    background:
      "bg-background-succes-type-2 dark:bg-background-succes-type-2-dark",
    id: "ratingPercentNumberData",
  },
  "ratingTrend%": {
    name: "ratingPercentTrendNumber",
    metric: "Live/TSV Consumption",
    title: "Live Watch",
    description: "Tổng thời gian thực tế người dùng xem Live TV.",
    isPercent: false,
    icon: iconEye,
    widthIcon: "w-5.5 max-lg:w-5 max-md:w-4.5",
    color: "text-color-rating",
    background:
      "bg-background-succes-type-2 dark:bg-background-succes-type-2-dark",
    id: "ratingPercentTrendNumberData",
  },
};

export const METRIC_SPOTS = {
  spend_vnd: {
    icon: iconVND,
    widthIcon: "w-5.5 max-lg:w-5 max-md:w-4.5",
    background:
      "bg-background-succes-type-2 dark:bg-background-succes-type-2-dark",
  },
  spend_usd: {
    icon: iconDollar,
    widthIcon: "w-5.5 max-lg:w-5 max-md:w-4.5",
    background:
      "bg-background-succes-type-2 dark:bg-background-succes-type-2-dark",
  },
  count: {
    icon: iconCount,
    widthIcon: "w-4.25 max-lg:w-3.75 max-md:w-3.25",
    background: "bg-background-purple dark:bg-background-purple-dark",
  },
  duration: {
    icon: iconDuration,
    widthIcon: "w-5 max-lg:w-4.5 max-md:w-4",
    background: "bg-background-purple dark:bg-background-purple-dark",
  },
};
