const Access = '__swiftswap_token';

export const setLocalToken = (token) => {
  localStorage.setItem(Access, token);
};

export const getLocalToken = () => {
  const token = localStorage.getItem(Access);
  return token ? token : '';
};

export const clearLocalToken = () => {
  localStorage.removeItem(Access);
};
