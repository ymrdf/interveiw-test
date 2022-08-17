import { post, get } from '../../util/request';

export const createInterview = () => {
  return post('interview', {});
};

export const getInterview = (id: string) => {
  return get(`interview/${id}`, {});
};
