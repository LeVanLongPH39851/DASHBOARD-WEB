import { useApi } from '../useApi';
import { getAveReachPercentNumberChart } from '../../api/dashboardApi';

export const useAveReachPercentNumberChartReturnApi = () => {
  return useApi(getAveReachPercentNumberChart);
};