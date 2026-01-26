import { useApi } from '../useApi';
import { getRatingPercentNumberChart } from '../../api/dashboardApi';

export const useRatingPercentNumberChartReturnApi = () => {
  return useApi(getRatingPercentNumberChart);
};