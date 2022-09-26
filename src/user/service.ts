import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { encrypt } from '../utils/encryption';
import { v4 } from 'uuid';
import { User } from './user.model';

@Injectable()
export default class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  /**
   * 注册用户方法
   * @param createUser 用户信息
   * @returns Promise
   */
  async register(createUser: { name: string; password: string }) {
    const { name, password } = createUser;

    // 判断用户表中是否有同名用户，有的话抛出错误
    const existUser = await this.userModel.findOne({
      where: { name },
    });
    if (existUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

    // 用uuid库给密码加密，然后保存在用户表中
    return await this.userModel.create({
      ...createUser,
      id: v4(),
      password: encrypt(password),
    });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        id,
      },
    });
  }

  findOneByname(name: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        name,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}
