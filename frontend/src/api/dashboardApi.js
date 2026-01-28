import axiosClient from './axiosClient';
import * as payloads from './payloads';

const apiRoute = '/api/superset'

export const getRatingNumberChart = () =>
  axiosClient.post(apiRoute, payloads.ratingNumberChartPayload)

export const getAveReachNumberChart = () =>
  axiosClient.post(apiRoute, payloads.aveReachNumberChartPayload)

export const getRatingPercentNumberChart = () =>
  axiosClient.post(apiRoute, payloads.ratingPercentNumberChartPayload)

export const getAveReachPercentNumberChart = () =>
  axiosClient.post(apiRoute, payloads.aveReachPercentNumberChartPayload)

export const getRatingBarChartChannelEvent = () =>
  axiosClient.post(apiRoute, payloads.ratingBarChartChannelEventPayload)

export const getAveReachBarChartChannelEvent = () =>
  axiosClient.post(apiRoute, payloads.aveReachBarChartChannelEventPayload)

export const getRatingBarChartDayEvent = () =>
  axiosClient.post(apiRoute, payloads.ratingBarChartDayEventPayload)

export const getAveReachBarChartDayEvent = () =>
  axiosClient.post(apiRoute, payloads.aveReachBarChartDayEventPayload)

export const getRatingPercentLineChartTimebandChannel = () =>
  axiosClient.post(apiRoute, payloads.ratingPercentLineChartTimebandChannelPayload)

export const getRatingReachPercentMixedChartTimeband = () =>
  axiosClient.post(apiRoute, payloads.ratingReachPercentMixedChartTimebandPayload)