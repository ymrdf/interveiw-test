import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'name' });
  }

  // 用于调用AuthService中的validateUser方法校验用户名密码是否合法。
  async validate(name: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(name, password);
    // 不合法抛出验证错误，
    if (!user) {
      throw new UnauthorizedException();
    }
    // 合法的话返回用户信息。
    return user;
  }
}
