import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { User } from './modules/users/models/user.model.js';
import { Comment } from './modules/comments/models/comment.model.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { appConfig, databaseConfig } from './config/configuration.js';
import { envSchema } from './config/validation.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CacheModule } from './modules/cache/cache.module.js';
import { CaptchaModule } from './modules/captcha/captcha.module.js';
import { CommentsModule } from './modules/comments/comments.module.js';
import { EventsModule } from './modules/events/events.module.js';
import { QueueModule } from './modules/queue/queue.module.js';
import { UploadsModule } from './modules/uploads/uploads.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validationSchema: envSchema,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CommentsModule,
    CaptchaModule,
    UploadsModule,
    CacheModule,
    QueueModule,
    EventsModule,
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
