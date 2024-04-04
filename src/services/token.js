import request from "./request";

export function getToken(address) {
  return request(`/v1/token/${address}`, {
    method: 'get',
  })
}

export function getTokens(params) {
  return request(`/v1/token/all`, {
    method: 'get',
    params
  })
}

export function getSwaps(address, params) {
  return request(`/v1/token/${address}/swaps`, {
    method: 'get',
    params
  })
}

export function getCandles(address, params) {
  return request(`/v1/token/${address}/candles`, {
    method: 'get',
    params
  })
}