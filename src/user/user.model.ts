import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column({ primaryKey: true })
  id: string;

  @Column
  name: string;

  @Column
  password: string;
}
