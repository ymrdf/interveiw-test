import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

/**
 * jwt验证策略
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 为其构建函数中为super传入jwtFromRequest等配置，
  // jwtStrategy会自动从请求中获取jwt token并解析成用户信息
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('authorization'), // token从authorization请求头获取
      ignoreExpiration: false, // token会过期
      secretOrKey: jwtConstants.secret, // 密钥
    });
  }

  // validate直接返回用户信息
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
