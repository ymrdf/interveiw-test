import * as crypto from 'crypto';

export const encrypt = (str: string) => {
  const md5 = crypto.createHash('md5');
  const md5Sum = md5.update(str);
  const result = md5Sum.digest('base64');
  return result;
};
