
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';

import { Comment } from '../../comments/models/comment.model.js';
import {
  type CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  type NonAttribute,
} from 'sequelize';

@Table({
  tableName: 'attachments',
  timestamps: false,
})
export class Attachment extends Model<
  InferAttributes<Attachment>,
  InferCreationAttributes<Attachment>
  > {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => Comment)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare commentId: string;

  @BelongsTo(() => Comment)
  declare comment: NonAttribute<Comment>;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare originalName: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare filename: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare mimeType: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare size: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  declare path: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;
}
