import TurndownService from 'turndown';

export const turndownService = new TurndownService({
  hr: '---',
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export const parseHtmlToMarkdown = (html: string) => turndownService.turndown(html);
