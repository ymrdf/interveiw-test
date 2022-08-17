import {
  BeforeCreate,
  ForeignKey,
  Column,
  Model,
  Table,
} from 'sequelize-typescript';
import { v4 } from 'uuid';
import { User } from '../user/user.model';

@Table
export class Interview extends Model {
  @Column({ primaryKey: true })
  id: string;

  @ForeignKey(() => User)
  @Column
  interviewerId: string;

  @ForeignKey(() => User)
  @Column
  intervieweeId: string;

  @BeforeCreate
  static addId(instance: Interview) {
    instance.id = v4();
  }
}
