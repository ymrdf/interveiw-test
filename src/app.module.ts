import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    EventsModule,
    CodeModule,
    UserModule,
    // 配置数据库的链接信息
    SequelizeModule.forRoot({
      dialect: 'mysql', // 数据库类型
      host: 'localhost', // 地址
      port: 3306, // 端口
      username: 'root', // 用户名
      password: 'ymrdf', // 密码
      database: 'interview', // 数据库
      models: [User, Interview], // 数据模型
    }),
    AuthModule,
    InterviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
