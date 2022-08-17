import { Module } from '@nestjs/common';
import { InterviewModule } from '../interview/interview.module';
import { CollaborateGateway } from './collaborate.gateway';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [InterviewModule],
  providers: [CollaborateGateway, EventsGateway],
})
export class EventsModule {}
