import request from './request';

export function getUserNonce(params) {
  return request('/v1/auth/nonce', {
    method: 'GET',
    params
  });
}

export function login(data) {
  return request('/v1/auth/login', {
    method: 'POST',
    data: data,
  });
}

export function getAuthUser() {
  return request('/v1/user/me', {
    method: 'GET',
  });
}
