import { Controller, Get, Param, Post, Request, Body } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { Interview } from './interview.model';

/**
 * 与面试相关请求
 */
@Controller('api/interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get(':id')
  async getInterview(@Param('id') id: string): Promise<Interview> {
    const res = await this.interviewService.findOne(id);
    return res;
  }

  @Post()
  async createInterview(@Request() req): Promise<Interview> {
    console.log(req.user);
    const res = await this.interviewService.createOne(req.user.userId);
    return res;
  }

  @Post(':id')
  async updateInterview(
    @Body() body: any,
    @Param('id') id: string,
  ): Promise<Interview> {
    const res = await this.interviewService.updateOne(id, body);
    return res;
  }
}
