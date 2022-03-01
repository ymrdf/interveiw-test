import { Controller, Get, Query, Put, Body } from '@nestjs/common';
import UserService from './service';

@Controller('user')
export default class CodeController {
  constructor(private readonly appService: UserService) {}

  @Get('hello')
  getHello(@Query() request: any): string {
    this.appService
      .findAll()
      .then((data) => {
        console.log('data', data);
      })
      .catch((e) => {
        console.log(e);
      });
    return this.appService.getHello();
  }

  @Put('register')
  register(@Body() request: any): string {
    this.appService
      .register({ name: request.name, password: request.password })
      .catch((e) => {
        console.log(e);
      });
    return this.appService.getHello();
  }
}
