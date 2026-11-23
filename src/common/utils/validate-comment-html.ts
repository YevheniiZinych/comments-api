
import { Parser } from 'htmlparser2';

const ALLOWED_TAGS = new Set([
  'a',
  'code',
  'i',
  'strong',
]);

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export function validateCommentHtml(html: string): boolean {
  const stack: string[] = [];
  let isValid = true;

  const parser = new Parser(
    {
      onopentag(name) {
        if (!ALLOWED_TAGS.has(name)) {
          isValid = false;
          return;
        }

        stack.push(name);
      },

      onclosetag(name) {
        if (!ALLOWED_TAGS.has(name)) {
          isValid = false;
          return;
        }

        const lastTag = stack.pop();

        if (lastTag !== name) {
          isValid = false;
        }
      },

      onerror() {
        isValid = false;
      },
    },
    {
      xmlMode: true,
      decodeEntities: true,
    },
  );

  try {
    parser.write(html);
    parser.end();
  } catch {
    return false;
  }

  return isValid && stack.length === 0;
}

