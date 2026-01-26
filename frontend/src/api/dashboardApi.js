import axiosClient from './axiosClient';
import { 
  ratingNumberChartPayload,
  aveReachNumberChartPayload,
  ratingPercentNumberChartPayload,
  aveReachPercentNumberChartPayload,
  ratingBarChartChannelEventPayload
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