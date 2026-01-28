import { useApi } from '../useApi';
import { getRatingReachPercentMixedChartTimeband } from '../../api/dashboardApi';

export const useRatingReachPercentMixedChartTimebandReturnApi = () => {
  return useApi(getRatingReachPercentMixedChartTimeband);
};