import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../modules/users/models/user.model.js';
import { Comment } from '../modules/comments/models/comment.model.js';
import { Attachment } from '../modules/uploads/models/attachment.model.js';

@Injectable()
class CommentAttachmentAssociation implements OnModuleInit {
  onModuleInit() {
    Comment.hasMany(Attachment, {
      foreignKey: 'commentId',
      as: 'attachments',
    });
  }
}

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.getOrThrow<string>('database.host'),
        port: config.getOrThrow<number>('database.port'),
        username: config.getOrThrow<string>('database.user'),
        password: config.getOrThrow<string>('database.password'),
        database: config.getOrThrow<string>('database.name'),
        models: [User, Comment, Attachment],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
  providers: [CommentAttachmentAssociation],
})
export class DatabaseModule {}
