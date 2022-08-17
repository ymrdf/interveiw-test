import { observable, action, makeAutoObservable } from 'mobx';
import { getProfile } from './apis';
import type { IUser } from './type';

class Profile {
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
