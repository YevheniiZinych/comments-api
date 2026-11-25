import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import {
  type CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  type NonAttribute,
} from 'sequelize';
import { User } from '../../users/models/user.model.js';
import type { Attachment } from '../../uploads/models/attachment.model.js';

@Table({
  tableName: 'comments',
  timestamps: true,
})
export class Comment extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare author: NonAttribute<User>;

  @ForeignKey(() => Comment)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare parentId: string | null;

  @BelongsTo(() => Comment, {
    foreignKey: 'parentId',
    as: 'parent',
  })
  declare parent: NonAttribute<Comment | null>;

  @HasMany(() => Comment, {
    foreignKey: 'parentId',
    as: 'replies',
  })
  declare replies: NonAttribute<Comment[]>;

  declare attachments: NonAttribute<Attachment[]>;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare text: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}
