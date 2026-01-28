import { useApi } from '../useApi';
import { getRatingPercentLineChartTimebandChannel } from '../../api/dashboardApi';

export const useRatingReachPercentLineChartReturnApi = () => {
  return useApi(getRatingPercentLineChartTimebandChannel);
};