import { type CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  declare id: CreationOptional<string>;

  @Unique
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare username: string;

  @Unique
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare homepage: string | null;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAtAt: CreationOptional<Date>;
}
