import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UploadsController } from './uploads.controller.js';
import { UploadsService } from './uploads.service.js';
import { Attachment } from './models/attachment.model.js';

@Module({
  imports: [SequelizeModule.forFeature([Attachment])],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [
    UploadsService,
  ],
})
export class UploadsModule {}
