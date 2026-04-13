import iconEye from '../assets/icon_eye.png';
import iconUsers from '../assets/icon_users.png';

export const METRICS = {
  rating: {
    name: 'ratingNumber',
    metric: 'rating',
    title: 'Rating (000)',
    description: 'Số lượng khán giả trung bình mỗi phút đã xem ít nhất một lượt',
    isPercent: false,
    icon: iconEye,
    widthIcon: 'w-5.5 max-lg:w-5 max-md:w-4.5',
    color: 'text-color-rating',
    background: 'bg-background-succes-type-2 dark:bg-background-succes-type-2-dark'
  },
  ave_reach: {
    name: 'aveReachNumber',
    metric: 'ave_reach',
    title: 'Ave.Reach (000)',
    description: 'Số lượng khán giả (không trùng lặp) trung bình mỗi ngày tính trên dân số từ 4-80 tuổi',
    isPercent: false,
    icon: iconUsers,
    widthIcon: 'w-6 max-lg:w-5.5 max-md:w-5',
    color: 'text-color-ave-reach',
    background: 'bg-background-purple dark:bg-background-purple-dark'
  },
  'rating%': {
    name: 'ratingPercentNumber',
    metric: 'rating%',
    title: 'Rating (%)',
    description: 'Tỉ lệ khán giả trung bình mỗi phút tính trên dân số từ 4-80 tuổi. Rating% cho biết có bao nhiêu phần trăm dân số từ 4-80 tuổi đã xem',
    isPercent: true,
    icon: iconEye,
    widthIcon: 'w-5.5 max-lg:w-5 max-md:w-4.5',
    color: 'text-color-rating-percent',
    background: 'bg-background-succes-type-2 dark:bg-background-succes-type-2-dark'
  },
  'reach%': {
    name: 'aveReachPercentNumber',
    metric: 'reach%',
    title: 'Ave.Reach (%)',
    description: 'Tỉ lệ khán giả (không trùng lặp) trung bình mỗi ngày tính trên dân số từ 4-80 tuổi',
    isPercent: true,
    icon: iconUsers,
    widthIcon: 'w-6 max-lg:w-5.5 max-md:w-5',
    color: 'text-color-ave-reach-percent',
    background: 'bg-background-purple dark:bg-background-purple-dark'
  }
};