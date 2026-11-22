import { Transform } from 'class-transformer';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only Latin letters and numbers',
  })
  username: string

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string

  @Transform(({value}) => value === '' ? null : value)
  @IsOptional()
  @IsUrl(
    {
      require_protocol: true
    }
  )
  @MaxLength(255)
  homepage?: string | null

  @IsString()
  @IsNotEmpty()
  text: string

  @IsOptional()
  @IsUUID()
  parentId?: string
}