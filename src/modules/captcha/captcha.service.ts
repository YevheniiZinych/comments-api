
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import * as svgCaptcha from 'svg-captcha';

import { randomUUID } from 'crypto';

interface CaptchaRecord {
  answer: string;
  expiresAt: number;
}

@Injectable()
export class CaptchaService {

  // Временное хранилище CAPTCHA
  private readonly captchas = new Map<string, CaptchaRecord>();

  // Время жизни CAPTCHA — 5 минут
  private readonly CAPTCHA_TTL = 5 * 60 * 1000;

  // Генерация CAPTCHA
  generate() {
    // Удаляем просроченные CAPTCHA
    this.removeExpired();

    // Генерируем изображение и текст
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 3,
      color: false,
      background: '#ffffff',
      ignoreChars: '0o1i',
    });

    // Создаём уникальный идентификатор
    const captchaId = randomUUID();

    // Сохраняем правильный ответ на сервере
    this.captchas.set(captchaId, {
      answer: captcha.text.toUpperCase(),
      expiresAt: Date.now() + this.CAPTCHA_TTL,
    });

    // Преобразуем SVG в Base64
    const image = Buffer
      .from(captcha.data)
      .toString('base64');

    return {
      captchaId,
      image: `data:image/svg+xml;base64,${image}`,
    };
  }

  // Проверка CAPTCHA
  verify(captchaId: string, answer: string): void {
    const captcha = this.captchas.get(captchaId);

    // Удаляем CAPTCHA после первой попытки
    this.captchas.delete(captchaId);

    // Проверяем существование и срок действия
    if (!captcha || captcha.expiresAt < Date.now()) {
      throw new BadRequestException(
        'CAPTCHA expired or not found',
      );
    }

    // Сравниваем ответы без учёта регистра
    const normalizedAnswer = answer.trim().toUpperCase();

    if (captcha.answer !== normalizedAnswer) {
      throw new BadRequestException(
        'Invalid CAPTCHA',
      );
    }
  }

  // Удаление просроченных записей
  private removeExpired(): void {
    const now = Date.now();

    for (const [id, captcha] of this.captchas.entries()) {
      if (captcha.expiresAt < now) {
        this.captchas.delete(id);
      }
    }
  }
}
