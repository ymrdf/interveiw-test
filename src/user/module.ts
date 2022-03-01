import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import Controller from './controller';
import UserService from './service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [Controller],
  providers: [UserService],
  exports: [UserService],
})
export default class CodeModule {}
