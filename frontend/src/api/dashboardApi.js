import axiosClient from './axiosClient';
import { 
  ratingNumberChartPayload,
  aveReachNumberChartPayload,
  ratingPercentNumberChartPayload,
  aveReachPercentNumberChartPayload,
  ratingBarChartChannelEventPayload,
  ratingPercentLineChartTimebandChannelPayload,
  ratingReachPercentMixedChartTimebandPayload
} from './payloads';

const apiRoute = '/api/superset'

export const getRatingNumberChart = () =>
  axiosClient.post(apiRoute, ratingNumberChartPayload)

export const getAveReachNumberChart = () =>
  axiosClient.post(apiRoute, aveReachNumberChartPayload)

export const getRatingPercentNumberChart = () =>
  axiosClient.post(apiRoute, ratingPercentNumberChartPayload)

export const getAveReachPercentNumberChart = () =>
  axiosClient.post(apiRoute, aveReachPercentNumberChartPayload)

export const getRatingBarChartChannelEvent = () =>
  axiosClient.post(apiRoute, ratingBarChartChannelEventPayload)

export const getRatingPercentLineChartTimebandChannel = () =>
  axiosClient.post(apiRoute, ratingPercentLineChartTimebandChannelPayload)

export const getRatingReachPercentMixedChartTimeband = () =>
  axiosClient.post(apiRoute, ratingReachPercentMixedChartTimebandPayload)