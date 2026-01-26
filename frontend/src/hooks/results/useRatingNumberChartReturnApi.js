import { useApi } from '../useApi';
import { getRatingNumberChart } from '../../api/dashboardApi';

export const useRatingNumberChartReturnApi = () => {
  return useApi(getRatingNumberChart);
};