
import {
  Controller,
  Get,
  Param,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import * as path from 'path';

import { Attachment } from './models/attachment.model.js';

@Controller('uploads')
export class UploadsController {

  constructor(
    @InjectModel(Attachment)
    private readonly attachmentModel: typeof Attachment,
  ) {}

  @Get(':id')
  async getFile(
    @Param('id') id: string,
  ): Promise<StreamableFile> {

    const attachment = await this.attachmentModel.findByPk(id);

    if (!attachment) {
      throw new NotFoundException('File not found');
    }

    const filePath = path.resolve(attachment.path);

    try {
      await access(filePath);
    } catch {
      throw new NotFoundException('File not found');
    }

    const stream = createReadStream(filePath);

    return new StreamableFile(stream, {
      type: attachment.mimeType,
      disposition: `inline; filename*=UTF-8''${encodeURIComponent(
        attachment.originalName,
      )}`,
    });
  }
}
