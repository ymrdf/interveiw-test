import {
  Controller,
  Get,
  Query,
  Res,
  Body,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { SkipAuth } from '../auth/utils';
import UserService from './service';
import { User } from './user.model';

@Controller('api/user')
export default class CodeController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
  ) {}

  /**
   * 处理登录请求
   * @param req 请求对象
   * @returns token 返回token
   */
  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const token = this.authService.login(req.user);
    return token;
  }

  /**
   * 处理注册请求
   * @param request 请求对象
   * @returns Promise<User> 用户信息
   */
  @SkipAuth()
  @Post('register')
  async register(@Body() request: any): Promise<User> {
    const res = await this.userService.register({
      name: request.name,
      password: request.password,
    });
    return res;
  }
}
