import iconEye from '../assets/icon_eye.png';
import iconUsers from '../assets/icon_users.png';

export const METRICS = {
  rating: {
    name: 'ratingNumber',
    metric: 'rating',
    title: 'Rating (000)',
    description: 'Tỷ lệ khán giả đang xem',
    isPercent: false,
    icon: iconEye,
    widthIcon: 'w-5.5',
    color: 'text-color-rating',
    background: 'bg-background-succes-type-2'
  },
  ave_reach: {
    name: 'aveReachNumber',
    metric: 'ave_reach',
    title: 'Ave.Reach (000)',
    description: 'Tỷ lệ trung bình khán giả duy nhất',
    isPercent: false,
    icon: iconUsers,
    widthIcon: 'w-6',
    color: 'text-color-ave-reach',
    background: 'bg-background-purple'
  },
  'rating%': {
    name: 'ratingPercentNumber',
    metric: 'rating%',
    title: 'Rating (%)',
    description: 'Tỷ lệ khán giả đang xem (%)',
    isPercent: true,
    icon: iconEye,
    widthIcon: 'w-5.5',
    color: 'text-color-rating-percent',
    background: 'bg-background-succes-type-2'
  },
  'reach%': {
    name: 'aveReachPercentNumber',
    metric: 'reach%',
    title: 'Reach (%)',
    description: 'tỷ lệ trung bình (%) khán giả duy nhất',
    isPercent: true,
    icon: iconUsers,
    widthIcon: 'w-6',
    color: 'text-color-ave-reach-percent',
    background: 'bg-background-purple'
  }
};