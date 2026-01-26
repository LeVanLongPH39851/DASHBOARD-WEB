import { useApi } from '../useApi';
import { getAveReachNumberChart } from '../../api/dashboardApi';

export const useAveReachNumberChartReturnApi = () => {
  return useApi(getAveReachNumberChart);
};