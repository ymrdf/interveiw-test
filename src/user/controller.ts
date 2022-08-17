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

  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const token = this.authService.login(req.user);
    return token;
  }

  @Get('hello')
  getHello(@Query() request: any): string {
    this.userService
      .findAll()
      .then((data) => {
        console.log('data', data);
      })
      .catch((e) => {
        console.log(e);
      });
    return this.userService.getHello();
  }

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
