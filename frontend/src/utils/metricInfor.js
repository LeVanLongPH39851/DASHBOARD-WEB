import { faUsers, faStar, faPercent, faChartLine } from '@fortawesome/free-solid-svg-icons';
export const METRICS = {
  rating: {
    name: 'ratingNumber',
    metric: 'rating',
    title: 'Rating',
    description: 'Tỷ lệ khán giả đang xem',
    isPercent: false,
    icon: faStar,
    color: 'text-color-rating',
    background: 'bg-background-rating'
  },
  ave_reach: {
    name: 'aveReachNumber',
    metric: 'ave_reach',
    title: 'Ave.Reach',
    description: 'Tỷ lệ trung bình khán giả duy nhất',
    isPercent: false,
    icon: faUsers,
    color: 'text-color-ave-reach',
    background: 'bg-background-ave-reach'
  },
  'rating%': {
    name: 'ratingPercentNumber',
    metric: 'rating%',
    title: 'Rating (%)',
    description: 'Tỷ lệ khán giả đang xem (%)',
    isPercent: true,
    icon: faChartLine,
    color: 'text-color-rating-percent',
    background: 'bg-background-rating-percent'
  },
  'reach%': {
    name: 'aveReachPercentNumber',
    metric: 'reach%',
    title: 'Reach (%)',
    description: 'tỷ lệ trung bình (%) khán giả duy nhất',
    isPercent: true,
    icon: faPercent,
    color: 'text-color-ave-reach-percent',
    background: 'bg-background-ave-reach-percent'
  }
};