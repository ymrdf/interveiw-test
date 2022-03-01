import { Controller, Get, Query } from '@nestjs/common';
import { CodeService } from './code.service';

@Controller('hello')
export class CodeController {
  constructor(private readonly appService: CodeService) {}

  @Get('world')
  getHello(@Query() request: any): string {
    return this.appService.getHello();
  }
}
