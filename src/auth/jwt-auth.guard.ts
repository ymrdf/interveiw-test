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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // @ts-ignore
    if (context.contextType === 'ws') {
      // @ts-ignore
      const res = jwt.verify(context.args[1].token, jwtConstants.secret);
      console.log('--->', res);
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
    // @ts-ignore
    // console.log(context.args[0] instanceof Socket);
    return super.canActivate(context);
  }
}
