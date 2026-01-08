import { PageContent, NavigationItem } from '../types';
import prettier from 'prettier';
import { md } from '../utils/md-builder';

const buildNavigationMarkdown = (items: NavigationItem[], baseUrl: string, level = 0): string[] => {
  const lines: string[] = [];
  const indent = '  '.repeat(level);

  items.forEach((item) => {
    if (item.href) {
      const fullUrl = item.href.startsWith('http')
        ? item.href
        : new URL(item.href, baseUrl).toString();
      lines.push(`${indent}- ${md.link(item.text, fullUrl)}`);
    } else {
      lines.push(`${indent}- **${item.text}**`);
    }

    if (item.children && item.children.length > 0) {
      lines.push(...buildNavigationMarkdown(item.children, baseUrl, level + 1));
    }
  });

  return lines;
};

export const buildPageContentMarkdown = async (pageContent: PageContent): Promise<string> => {
  const sections: string[] = [];

  // Title
  sections.push(md.header(pageContent.title, 1));

  // URL
  sections.push(md.link('Source URL', pageContent.url));
  sections.push(md.horizontalRule());

  // Navigation section (if included)
  if (pageContent.navigation && pageContent.navigation.length > 0) {
    sections.push(md.header('Navigation', 2));
    sections.push(...buildNavigationMarkdown(pageContent.navigation, pageContent.url));
    sections.push(md.horizontalRule());
  }

  // Headings structure
  if (pageContent.headings.length > 0) {
    sections.push(md.header('Table of Contents', 2));
    const tocItems = pageContent.headings.map((h) => {
      const indent = '  '.repeat(Math.max(0, h.level - 1));
      return `${indent}- ${h.text}`;
    });
    sections.push(tocItems.join('\n'));
    sections.push(md.horizontalRule());
  }

  // Main content
  sections.push(md.header('Content', 2));

  // Split content into paragraphs and format
  const paragraphs = await buildContent(pageContent.content);

  sections.push(paragraphs);

  // Links section
  if (pageContent.links.length > 0) {
    sections.push(md.horizontalRule());
    sections.push(md.header('Links', 2));
    const linkItems = pageContent.links
      .filter((link) => link.href && link.text)
      .map((link) => {
        // Resolve relative URLs
        const fullUrl = link.href.startsWith('http')
          ? link.href
          : new URL(link.href, pageContent.url).toString();
        return md.link(link.text, fullUrl);
      });
    sections.push(md.unordered(linkItems));
  }

  return md.build(sections);
};

const buildContent = async (textContent: string): Promise<string> => {
  const words = textContent.split(/\s+/).filter((word) => word.length > 0);
  const maxLineLength = 100;
  const lines: string[] = [];

  let currentLine = '';
  for (const word of words) {
    const wouldExceedMaxLength = currentLine.length + word.length > maxLineLength;

    if (!wouldExceedMaxLength) {
      //Add a space if the current line is not empty
      currentLine += (currentLine.length > 0 ? ' ' : '') + word;
      continue;
    }

    lines.push(currentLine);
    if (lines.length % 20 === 0) {
      //Add a empty string that will be converted to a new line
      lines.push('');
    }
    currentLine = word;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
    if (lines.length % 20 === 0) {
      lines.push('');
    }
  }

  const formatted = lines.join('\n');

  return await prettier.format(formatted, {
    parser: 'markdown',
    printWidth: 100,
    proseWrap: 'preserve',
  });
};
