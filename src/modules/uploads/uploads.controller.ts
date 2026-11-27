
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

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {

  constructor(
    @InjectModel(Attachment)
    private readonly attachmentModel: typeof Attachment,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Получить загруженный файл',
    description:
      'Возвращает файл по идентификатору вложения.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID вложения.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Файл успешно получен.',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Файл не найден.',
  })
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
