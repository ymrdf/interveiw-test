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

  getHello(): string {
    return 'Hello World!';
  }

  async register(createUser: { name: string; password: string }) {
    const { name, password } = createUser;

    const existUser = await this.userModel.findOne({
      where: { name },
    });
    if (existUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

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
