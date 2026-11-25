import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { InjectConnection } from '@nestjs/sequelize';

import { Sequelize, QueryTypes } from 'sequelize';

import { User } from '../users/models/user.model.js';
import { Comment } from './models/comment.model.js';
import { Attachment } from '../uploads/models/attachment.model.js';

import { CreateCommentDto } from './dto/create-comment.dto.js';
import { GetCommentsDto } from './dto/get-comments.dto.js';

import { sanitizeCommentHtml } from '../../common/utils/html-sanitizer.js';
import { validateCommentHtml } from '../../common/utils/validate-comment-html.js';

import { CaptchaService } from '../captcha/captcha.service.js';
import { UploadsService } from '../uploads/uploads.service.js';

const COMMENTS_PER_PAGE = 25;

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private readonly commentModel: typeof Comment,

    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(Attachment)
    private readonly attachmentModel: typeof Attachment,

    @InjectConnection()
    private readonly sequelize: Sequelize,

    private readonly captchaService: CaptchaService,

    private readonly uploadsService: UploadsService,
  ) {}

  async create(dto: CreateCommentDto, file?: Express.Multer.File) {
    // Проверяем на на валидность и допустипость тегов
    if (!validateCommentHtml(dto.text)) {
      throw new BadRequestException(
        'Invalid HTML structure or unsupported tags. Allowed tags a, code, i, strong,',
      );
    }

    // Очищаем HTML
    const sanitizedText = sanitizeCommentHtml(dto.text);

    // Проверяем CAPTCHA
    this.captchaService.verify(
    dto.captchaId,
    dto.captchaText,
    );

    // Сохраняем файл, если он передан
    const storedFile = file ? await this.uploadsService.saveFile(file) : null

    try {
      
      // Сохраняем пользователя и комментарий
    return this.sequelize.transaction(async (transaction) => {
      if (dto.parentId) {
        const parentComment = await this.commentModel.findByPk(dto.parentId, { transaction });

        if (!parentComment) {
          throw new NotFoundException('Parent comment not found');
        }
      }

      const [user, created] = await this.userModel.findOrCreate({
        where: {
          email: dto.email,
        },
        defaults: {
          username: dto.username,
          email: dto.email,
          homepage: dto.homepage ?? null,
        },
        transaction,
      });

      if (!created) {
        await user.update(
          {
            username: dto.username,
            homepage: dto.homepage ?? null,
          },
          { transaction },
        );
      }

      const comment = await this.commentModel.create(
        {
          userId: user.id,
          parentId: dto.parentId ?? null,
          text: sanitizedText,
        },
        { transaction },
      );

      if(storedFile) {
        await this.attachmentModel.create(
          {
            commentId: comment.id,
            ...storedFile
          },
          { transaction },
        )
      }

      return this.commentModel.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'email', 'homepage'],
          },
          {
            model: Attachment,
            as: 'attachments',
          },
        ],
        transaction,
      });
    });
    } catch (error) {
      // Если запись в БД не удалась,
    // удаляем ранее сохранённый файл
    if (storedFile) {
      await this.uploadsService.removeFile(storedFile.path);
    }

    throw error;
    }

    
  }

  async findAll(query: GetCommentsDto) {
    const { page = 1, sortBy = 'createdAt', order = 'DESC' } = query;

    const offset = (page - 1) * COMMENTS_PER_PAGE;

    const orderOptions =
      sortBy === 'createdAt'
        ? [
            ['createdAt', order],
            ['id', 'ASC'],
          ]
        : [
            [{ model: User, as: 'author' }, sortBy, order],
            ['id', 'ASC'],
          ];

    const { rows, count } = await this.commentModel.findAndCountAll({
      where: {
        parentId: null,
      },

      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'homepage'],
        },
      ],

      order: orderOptions as any,
      limit: COMMENTS_PER_PAGE,
      offset,
      distinct: true,
    });

    if (!rows.length) {
      return {
        data: [],
        meta: {
          total: count,
          page,
          limit: COMMENTS_PER_PAGE,
          totalPages: Math.ceil(count / COMMENTS_PER_PAGE),
        },
      };
    }

    // Получаем ID корневых комментариев
    const rootIds = rows.map((comment) => comment.id);

    //Получаем все вложенные комментарии
    const descendants = await this.getDescendants(rootIds);

    // Преобразуем результат в дерево
    const data = this.buildCommentTree(rows, descendants);

    await this.attachFilesToTree(data);

    return {
      data,
      meta: {
        total: count,
        page,
        limit: COMMENTS_PER_PAGE,
        totalPages: Math.ceil(count / COMMENTS_PER_PAGE),
      },
    };
  }

  private async getDescendants(rootIds: string[]) {
    const sql = `
    WITH RECURSIVE comment_tree AS (

      -- Первый уровень: непосредственные ответы
      SELECT
        c.*
      FROM comments c
      WHERE c."parentId" IN (:rootIds)

      UNION ALL

      -- Следующие уровни: ответы на найденные ответы
      SELECT
        child.*
      FROM comments child
      INNER JOIN comment_tree parent
        ON child."parentId" = parent.id
    )

    SELECT
      c.id,
      c."userId",
      c."parentId",
      c.text,
      c."createdAt",
      c."updatedAt",

      u.id AS "author.id",
      u.username AS "author.username",
      u.email AS "author.email",
      u.homepage AS "author.homepage"

    FROM comment_tree c

    INNER JOIN users u
      ON u.id = c."userId"

    ORDER BY c."createdAt" ASC;
  `;

    return this.sequelize.query(sql, {
      replacements: { rootIds },
      type: QueryTypes.SELECT,
      nest: true,
    });
  }

  private buildCommentTree(roots: Comment[], descendants: any[]) {
    const commentMap = new Map<string, any>();

    // Преобразуем корневые комментарии
    // в обычные объекты и добавляем replies
    const rootNodes = roots.map((comment) => {
      const node = {
        ...comment.get({ plain: true }),
        replies: [],
      };

      commentMap.set(node.id, node);

      return node;
    });

    // Добавляем потомков в Map
    for (const comment of descendants) {
      const node = {
        ...comment,
        replies: [],
      };

      commentMap.set(node.id, node);
    }

    // Строим дерево
    for (const node of commentMap.values()) {
      if (!node.parentId) {
        continue;
      }

      const parent = commentMap.get(node.parentId);

      if (parent) {
        parent.replies.push(node);
      }
    }

    return rootNodes;
  }

  private async attachFilesToTree(
    roots: any[],
  ) {
    const commentIds: string[] = [];

    const collectIds = (nodes: any[]) => {
      for (const node of nodes) {
        commentIds.push(node.id);
        collectIds(node.replies ?? []);
      }
    };

    collectIds(roots);
  
    const attachments = await this.attachmentModel.findAll({
      where: {
        commentId: commentIds,
      },
      attributes: [
        'id',
        'commentId',
        'originalName',
        'mimeType',
        'size',
      ],
    });
  
    const attachmentMap = new Map<string, any[]>();
  
    for (const attachment of attachments) {
      const item = attachment.get({ plain: true });
  
      const existing = attachmentMap.get(item.commentId) ?? [];
  
      existing.push(item);
  
      attachmentMap.set(item.commentId, existing);
    }
  
    const addAttachments = (nodes: any[]) => {
      for (const node of nodes) {
        node.attachments = attachmentMap.get(node.id) ?? [];
  
        addAttachments(node.replies ?? []);
      }
    };
  
    addAttachments(roots);
  }
}
