import request from "./request";

export function getOrders(params) {
  return request('/v1/order/list', {
    method: 'GET',
    params
  });
}

export function getOrderCount(params) {
  return request('/v1/order/count', {
    method: 'GET',
    params
  });
}

export function createOrder(data) {
  return request('/v1/order/create', {
    method: 'POST',
    data
  });
}

export function cancelOrder(data) {
  return request('/v1/order/cancel', {
    method: 'POST',
    data
  });
}

export function removeOrder(data) {
  return request('/v1/order/remove', {
    method: 'POST',
    data
  });
}
