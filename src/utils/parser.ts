import { gfm } from '@truto/turndown-plugin-gfm';
import TurndownService from 'turndown';

export const turndownService = new TurndownService({
  hr: '---',
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})
  .use(gfm)
  .addRule('parse-tips', {
    filter: (node) => node.nodeName === 'DIV' && node.childNodes[0]?.nodeName === 'svg',
    replacement: (content) =>
      '> [!important]' +
      content
        .trim()
        .split('\n')
        .reduce(
          (previous, line, i) => previous + '\n> ' + (i === 0 ? `**${line.trim()}**` : line.trim()),
          '',
        ),
  });

export const parseHtmlToMarkdown = (html: string) => turndownService.turndown(html);
