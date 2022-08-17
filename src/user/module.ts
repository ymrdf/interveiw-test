import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { User } from './user.model';
import Controller from './controller';
import UserService from './service';

@Module({
  imports: [SequelizeModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [Controller],
  providers: [UserService],
  exports: [UserService],
})
export default class CodeModule {}
