import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Comment } from './models/comment.model.js';
import { User } from '../users/models/user.model.js';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { CaptchaModule } from '../captcha/captcha.module.js';

@Module({
  imports: [SequelizeModule.forFeature([Comment, User]), CaptchaModule,],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
