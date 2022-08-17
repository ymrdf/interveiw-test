import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { Interview } from './interview.model';

@Module({
  imports: [SequelizeModule.forFeature([Interview])],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}
