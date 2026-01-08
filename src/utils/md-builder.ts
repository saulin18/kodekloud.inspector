import prettier from 'prettier';

/**
 * Build markdown with this ;)
 *
 * @example
 * ```ts
 * const markdown = md.build([
 *   md.header('Title', 1),
 *   'blah, blah, blah',
 *   md.unordered(['item 1', 'item 2']),
 *   md.ordered(['item 1', 'item 2']),
 *   md.bold('bold'),
 *   md.italic('italic'),
 *   md.codeBlock('code', 'js'),
 *   md.link('link', 'https://google.com'),
 *   md.table(['header 1', 'header 2'], [['row 1 col 1', 'row 1 col 2']]),
 *   md.blockquote('blockquote'),
 *   md.horizontalRule(),
 * ]);
 * ```
 */
export const md = {
  build: async function (sections: string[]) {
    const content = this.joinln(sections, '\n\n');
    return prettier.format(content, { parser: 'markdown' });
  },

  joinln: function (array: string[], separator = '\n') {
    return array.join(separator);
  },

  header: function (text: string, level = 1) {
    if (level < 1 || level > 6) {
      throw new Error('El nivel del encabezado debe estar entre 1 y 6');
    }
    return `${'#'.repeat(level)} ${text}`;
  },

  unordered: function (items: string[]) {
    return items.map((item) => `- ${item}`).join('\n');
  },

  ordered: function (items: string[]) {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
  },

  bold: function (text: string) {
    return `**${text}**`;
  },

  italic: function (text: string) {
    return `*${text}*`;
  },

  codeBlock: function (code: string, language = '') {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  },

  link: function (text: string, url: string) {
    return `[${text}](${url})`;
  },

  table: function (headers: string[], rows: string[][]) {
    if (!Array.isArray(headers) || !Array.isArray(rows)) {
      throw new TypeError('Los encabezados y filas deben ser arreglos');
    }

    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const bodyRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');

    return this.joinln([headerRow, separatorRow, bodyRows]);
  },

  blockquote: function (text: string) {
    return `> ${text}`;
  },

  horizontalRule: function () {
    return '---';
  },
};
