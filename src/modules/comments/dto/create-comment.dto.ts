import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Length
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Имя пользователя. Только латинские буквы и цифры.',
    example: 'John123',
    maxLength: 100,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only Latin letters and numbers',
  })
  username: string;

  @ApiProperty({
    description: 'Email пользователя.',
    example: 'john@example.com',
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({
    description: 'Домашняя страница пользователя.',
    example: 'https://example.com',
    nullable: true,
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  @MaxLength(255)
  homepage?: string | null;

  @ApiProperty({
    description: 'Текст комментария. Разрешены HTML-теги a, code, i, strong.',
    example: 'Hello! <strong>Nice website!</strong>',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    description: 'UUID родительского комментария. Для корневого комментария не передаётся.',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: 'Идентификатор CAPTCHA, полученный через GET /api/captcha.',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  captchaId: string;

  @ApiProperty({
    description: 'Ответ пользователя на CAPTCHA (6 символов).',
    example: 'ABC123',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^[a-zA-Z0-9]+$/)
  captchaText: string;
}
