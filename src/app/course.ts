import urlJoin from 'url-join';
import { config } from '../config';
import { scrapePageContent } from '../crawler/content';
import { NavigationItem } from '../types';
import { buildPageContentMarkdown } from './content';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdirSync } from 'fs';
import { crawlPageContentNavigation } from '../crawler/page-navigation';
import { CrawlerError } from '../types/error';

/**
 * Create directory based on url and scrap a course
 * - Write the course in output subfolder
 */
export const writeCourse = async (link: NavigationItem) => {
  const fullHref = urlJoin(config.baseUrl, link.href!);
  const navigation = await crawlPageContentNavigation(fullHref);

  // navigate for each navigation link
  const recursiveNavigation = async (items: NavigationItem[]) => {
    for (const item of items) {
      try {
        if (item.href) {
          const pageContent = await scrapePageContent(urlJoin(config.baseUrl, item.href));
          const markdown = await buildPageContentMarkdown(pageContent);
          await writeFile(
            path.join(config.outputDir, item.href, '..', item.href!.split('/').pop()! + '.md'),
            markdown,
          );
        } else if (item.children) {
          const reference = item.children[0].href!;
          mkdirSync(path.join(config.outputDir, reference, '..', reference.split('/').pop()!), {
            recursive: true,
          });
          await recursiveNavigation(item.children);
        }
      } catch (error) {
        if (error instanceof CrawlerError) {
          // continue the scraping
          error.message = `Failed to scrape ${item.href}: ${error.message}`;
          console.error(error);
          continue;
        }
        throw error;
      }
    }
  };

  await recursiveNavigation(navigation!);
};
