import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeModule } from './code/code.module';
import UserModule from './user/module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/user.model';
import { Interview } from './interview/interview.model';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { InterviewModule } from './interview/interview.module';

@Module({
  imports: [
    EventsModule,
    CodeModule,
    UserModule,
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'ymrdf',
      database: 'interview',
      models: [User, Interview],
    }),
    AuthModule,
    InterviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
