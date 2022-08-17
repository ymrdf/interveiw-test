import axios, { AxiosResponse } from 'axios';
import { message } from 'antd';
import { ACCESS_TOKEN } from '../constants';
import profileStore from '../module/profile/store';

import 'antd/es/message/style/css';

const API_PREFIX = '/api/';

const getDefaultHeader = () => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  return {
    Authorization: token || '',
  };
};

const dealBack = (res: AxiosResponse<any>) => {
  console.log(res);
  if ((res.status >= 200 && res.status < 300) || res.status === 304) {
    return res.data;
  } else if (res.status === 401) {
    message.error(res.statusText);
    profileStore.setUser(null);
    window.location.pathname = '/login';
  } else {
    message.error(res.statusText);
  }
};

export const get = (url: string, data: IKeyValues) => {
  return axios
    .get(API_PREFIX + url, {
      params: data,
      headers: { ...getDefaultHeader() },
    })
    .then(
      (res) => dealBack(res),
      (error) => {
        dealBack(error.response);
      },
    );
};

export const post = (url: string, data: IKeyValues) => {
  return axios
    .post(API_PREFIX + url, data, { headers: { ...getDefaultHeader() } })
    .then(
      (res) => dealBack(res),
      (error) => {
        dealBack(error.response);
      },
    );
};

export const put = (url: string, data: IKeyValues) => {
  return axios
    .put(API_PREFIX + url, data, { headers: { ...getDefaultHeader() } })
    .then(
      (res) => dealBack(res),
      (error) => {
        dealBack(error.response);
      },
    );
};

export const del = (url: string) => {
  return axios
    .delete(API_PREFIX + url, { headers: { ...getDefaultHeader() } })
    .then(
      (res) => dealBack(res),
      (error) => {
        dealBack(error.response);
      },
    );
};
