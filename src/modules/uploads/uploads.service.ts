
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import sharp, { type Metadata } from 'sharp';

import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import 'multer';

export interface StoredFile {
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  path: string;
}

@Injectable()
export class UploadsService {

  private readonly uploadDir = path.resolve(
    process.cwd(),
    'uploads',
  );

  async saveFile(
    file: Express.Multer.File,
  ): Promise<StoredFile> {

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const originalName = path.basename(file.originalname);
    const extension = path.extname(originalName).toLowerCase();

    // Создаём папку, если её ещё нет
    await fs.mkdir(this.uploadDir, {
      recursive: true,
    });

    // Обработка TXT
    if (extension === '.txt') {
      return this.saveTextFile(file, originalName);
    }

    // Обработка изображений
    return this.saveImage(file, originalName, extension);
  }

  private async saveTextFile(
    file: Express.Multer.File,
    originalName: string,
  ): Promise<StoredFile> {

    // 100 KB = 102400 bytes
    const MAX_SIZE = 100 * 1024;

    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        'TXT file must not exceed 100 KB',
      );
    }

    // Проверяем, что содержимое является UTF-8 текстом
    try {
      const text = new TextDecoder('utf-8', {
        fatal: true,
      }).decode(file.buffer);

      if (text.includes('\0')) {
        throw new Error('Binary content');
      }
    } catch {
      throw new BadRequestException(
        'Invalid TXT file content',
      );
    }

    const filename = `${randomUUID()}.txt`;

    const filePath = path.join(
      this.uploadDir,
      filename,
    );

    await fs.writeFile(filePath, file.buffer);

    return {
      originalName,
      filename,
      mimeType: 'text/plain',
      size: file.size,
      path: filePath,
    };
  }

  private async saveImage(
    file: Express.Multer.File,
    originalName: string,
    extension: string,
  ): Promise<StoredFile> {

    let metadata: Metadata;

    try {
      metadata = await sharp(file.buffer, {
        animated: true,
      }).metadata();
    } catch {
      throw new BadRequestException(
        'Invalid image file',
      );
    }

    // Проверяем реальный формат изображения
    const formats = {
      jpg: {
        format: 'jpeg',
        mimeType: 'image/jpeg',
      },
      jpeg: {
        format: 'jpeg',
        mimeType: 'image/jpeg',
      },
      png: {
        format: 'png',
        mimeType: 'image/png',
      },
      gif: {
        format: 'gif',
        mimeType: 'image/gif',
      },
    };

    const extensionWithoutDot = extension.slice(1) as keyof typeof formats;

    const formatInfo = formats[extensionWithoutDot];

    if (!formatInfo || metadata.format !== formatInfo.format) {
      throw new BadRequestException(
        'Only JPG, PNG and GIF images are allowed',
      );
    }

    const filename = `${randomUUID()}.${extensionWithoutDot}`;

    const filePath = path.join(
      this.uploadDir,
      filename,
    );

    // Пропорционально уменьшаем изображение
    let image = sharp(file.buffer, {
      animated: true,
    }).resize({
      width: 320,
      height: 240,
      fit: 'inside',
      withoutEnlargement: true,
    });

    // Сохраняем исходный формат
    switch (formatInfo.format) {
      case 'jpeg':
        image = image.jpeg();
        break;

      case 'png':
        image = image.png();
        break;

      case 'gif':
        image = image.gif();
        break;
    }

    const result = await image.toBuffer();

    await fs.writeFile(filePath, result);

    return {
      originalName,
      filename,
      mimeType: formatInfo.mimeType,
      size: result.length,
      path: filePath,
    };
  }

  // Удаление файла при ошибке сохранения комментария
  async removeFile(filePath: string): Promise<void> {
    await fs.unlink(filePath).catch(() => undefined);
  }
}

