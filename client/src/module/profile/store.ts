import { observable, action, makeAutoObservable } from 'mobx';
import { getProfile } from './apis';
import type { IUser } from './type';

/**
 * 用户信息model,用于处理用户信息相关逻辑
 */
class Profile {
  // 保存当前用户信息
  @observable.ref
  user: IUser | null = null;

  loading: boolean = false;

  @action
  setUser(v: IUser | null) {
    this.user = v;
  }

  @action
  setLoading(v: boolean) {
    this.loading = v;
  }

  // 获取用户信息
  async queryUser() {
    this.setLoading(true);
    const res = await getProfile();
    this.setUser(res);
    this.setLoading(false);
  }

  constructor() {
    makeAutoObservable(this);
  }
}

export default new Profile();
