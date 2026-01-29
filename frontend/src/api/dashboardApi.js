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

export const getAllTableChartChannel = () =>
  axiosClient.post(apiRoute, payloads.allTableChartChannelPayload)

export const getRatingBarChartRegional = () =>
  axiosClient.post(apiRoute, payloads.ratingBarChartRegionalPayload)

export const getRatingBarChartKeyCity = () =>
  axiosClient.post(apiRoute, payloads.ratingBarChartKeyCityPayload)

export const getRatingBarChartProvince = () =>
  axiosClient.post(apiRoute, payloads.ratingBarChartProvincePayload)

export const getRatingBarChartOthers = () =>
  axiosClient.post(apiRoute, payloads.ratingBarChartOthersPayload)

export const getAveReachBarChartRegional = () =>
  axiosClient.post(apiRoute, payloads.aveReachBarChartRegionalPayload)

export const getAveReachBarChartKeyCity = () =>
  axiosClient.post(apiRoute, payloads.aveReachBarChartKeyCityPayload)

export const getAveReachBarChartProvince = () =>
  axiosClient.post(apiRoute, payloads.aveReachBarChartProvincePayload)

export const getAveReachBarChartOthers = () =>
  axiosClient.post(apiRoute, payloads.aveReachBarChartOthersPayload)

export const getRatingReachPercentTableChartRegional = () =>
  axiosClient.post(apiRoute, payloads.ratingReachPercentTableChartRegionalPayload)

export const getRatingPercentLineChartTimebandChannel = () =>
  axiosClient.post(apiRoute, payloads.ratingPercentLineChartTimebandChannelPayload)

export const getRatingReachPercentMixedChartTimeband = () =>
  axiosClient.post(apiRoute, payloads.ratingReachPercentMixedChartTimebandPayload)