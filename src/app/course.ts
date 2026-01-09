import urlJoin from 'url-join';
import { config } from '../config';
import { scrapePageContent } from '../crawler/content';
import { NavigationItem } from '../types';
import { buildPageContentMarkdown } from './content';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdirSync } from 'fs';
import { crawlPageContentNavigation } from '../crawler/page-navigation';
import { CrawlerError } from '../utils/error';

/**
 * Create directory based on url and scrap a course
 * - Write the course in output subfolder
 */
export const writeCourse = async (link: NavigationItem) => {
  const fullHref = urlJoin(config.baseUrl, link.href!);
  const navigation = await crawlPageContentNavigation(fullHref);

  // navigate for each navigation link
  const recursiveNavigation = async (
    items: NavigationItem[],
    parentPath = path.join(config.outputDir, 'docs'),
  ) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const currentIndex = (i + 1).toString().padStart(2, '0');
      try {
        if (item.href) {
          // is a page
          const pageContent = await scrapePageContent(urlJoin(config.baseUrl, item.href));
          const markdown = await buildPageContentMarkdown(pageContent);

          const baseFileName = item.href.split('/').pop()!;
          const enumeratedFileName = `${currentIndex}_${baseFileName}.md`;

          await writeFile(path.join(parentPath, enumeratedFileName), markdown);
        } else if (item.children) {
          // is a folder
          const reference = item.children[0].href!;
          const baseFolderName = path.join(reference, '..').split('/').pop()!;
          const enumeratedFolderName = `${currentIndex}_${baseFolderName}`;
          const folderPath = path.join(parentPath, enumeratedFolderName);

          mkdirSync(folderPath, {
            recursive: true,
          });

          await recursiveNavigation(item.children, folderPath);
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

  await recursiveNavigation(
    navigation!,
    path.join(config.outputDir, link.href!.split('/').slice(0, 3).join('/')),
  );
};
