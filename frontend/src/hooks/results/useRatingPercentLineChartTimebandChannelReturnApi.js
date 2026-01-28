import { useApi } from '../useApi';
import { getRatingPercentLineChartTimebandChannel } from '../../api/dashboardApi';

export const useRatingPercentLineChartTimebandChannelReturnApi = () => {
  return useApi(getRatingPercentLineChartTimebandChannel);
};