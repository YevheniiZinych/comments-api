
import sanitizeHtml from 'sanitize-html';

export function sanitizeCommentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'a',
      'code',
      'i',
      'strong',
    ],

    allowedAttributes: {
      a: ['href', 'title'],
    },

    allowedSchemes: [
      'http',
      'https',
      'mailto',
    ],

    disallowedTagsMode: 'discard',
  });
}
