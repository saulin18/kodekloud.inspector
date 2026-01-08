import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { crawlLinks } from './crawler/links';
import { scrapePageContent } from './crawler/content';
import { config } from './config';
import { buildAllLinksMarkdown } from './app/links';
import { buildPageContentMarkdown } from './app/content';
import { closeBrowser } from './core/browser';
import { mkdirSync } from 'node:fs';
import urlJoin from 'url-join';
import { NavigationItem } from './types';

const main = async () => {
  try {
    const links = await crawlLinks(
      config.baseUrl,
      // get only docs links
      ({ href }) => href.startsWith('/docs'),
    );
    await writeFile(
      path.join(config.outputDir, 'All_links.md'),
      await buildAllLinksMarkdown('All links in ' + config.baseUrl, links),
    );

    // navigate for each link
    for (const link of links) {
      // create directory based on url
      const fullHref = urlJoin(config.baseUrl, link.href);
      const pageContent = await scrapePageContent(fullHref, true);

      // navigate for each navigation link
      const recursiveNavigation = async (items: NavigationItem[]) => {
        for (const item of items) {
          if (item.href) {
            const pageContent = await scrapePageContent(urlJoin(config.baseUrl, item.href), false);
            const markdown = await buildPageContentMarkdown(pageContent);
            await writeFile(
              path.join(config.outputDir, item.href, '..', item.href!.split('/').pop()! + '.md'),
              markdown,
            );
          } else if (item.children) {
            const reference = item.children[0].href!;
            mkdirSync(
              path.join(config.outputDir, reference, '../..', reference.split('/').pop()!),
              {
                recursive: true,
              },
            );
            await recursiveNavigation(item.children);
          }
        }
      };

      await recursiveNavigation(pageContent.navigation!);
    }
  } catch (error) {
    console.error('Crawler failed:', error);
    process.exit(1);
  } finally {
    await closeBrowser();
  }
};

void main();
