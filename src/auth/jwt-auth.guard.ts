import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from './constants';
import { Socket } from 'ws';
import { IS_PUBLIC_KEY } from './utils';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 当前是否是无需验证的公共请求
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 判断当前是否是websocket通信，是的话解析数据中的token合法的话通过
    // @ts-ignore
    if (context.contextType === 'ws') {
      // @ts-ignore
      const res = jwt.verify(context.args[1].token, jwtConstants.secret);
      if (res) {
        // @ts-ignore
        context.args[1].user = {
          // @ts-ignore
          username: res.username,
          // @ts-ignore
          userid: res.sub,
        };
        return true;
      }
    }
    return super.canActivate(context);
  }
}
