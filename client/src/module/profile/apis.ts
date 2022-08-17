import { post, get } from '../../util/request';

export const register = (data: any) => {
  return post('user/register', data);
};

export const login = (data: any) => {
  return post('user/login', data);
};

export const getProfile = () => {
  return get('profile', {});
};
