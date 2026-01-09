import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { crawlLinks } from './crawler/links';
import { config } from './config';
import { buildAllLinksMarkdown } from './app/links';
import { closeBrowser } from './core/browser';
import { writeCourse } from './app/course';
import { LinkInfo } from './types';

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

    // Split links into 3 batches
    const batchSize = Math.ceil(links.length / 3);

    // Process each batch in parallel
    await Promise.all(
      [
        links.slice(0, batchSize),
        links.slice(batchSize, batchSize * 2),
        links.slice(batchSize * 2),
      ].map(async (batch: LinkInfo[], index: number) => {
        for (const link of batch) {
          console.debug(`- Batch [${index + 1}]: Start course ${link.href}`);
          await writeCourse(link);
          console.debug(`- Batch [${index + 1}]: Completed ${link.href}`);
        }
      }),
    );
  } catch (error) {
    console.error('Crawler failed:', error);
    process.exit(1);
  } finally {
    await closeBrowser();
  }
};

void main();
