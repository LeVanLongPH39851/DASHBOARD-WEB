import { useApi } from '../useApi';
import { getRatingBarChartChannelEvent } from '../../api/dashboardApi';

export const useRatingBarChartChannelEventReturnApi = () => {
  return useApi(getRatingBarChartChannelEvent);
};