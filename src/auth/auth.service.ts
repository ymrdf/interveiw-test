import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { encrypt } from '../utils/encryption';
import UserService from '../user/service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  // 方法用于校验用户名密码是否与数据库中保存的用户名密码一致
  async validateUser(name: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByname(name);
    // 校验密码是否一致
    if (user && user.password === encrypt(pass)) {
      const { password, ...result } = user.toJSON();
      return result;
    }
    return null;
  }

  // 调用jwtService实际的sign方法把用户名用户ID信息加密生成jwt token并返回
  async login(user: any) {
    const payload = { username: user.name, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
