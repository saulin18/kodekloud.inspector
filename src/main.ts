import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { crawlLinks } from './crawler/links';
import { config } from './config';
import { buildAllLinksMarkdown } from './app/links';
import { closeBrowser } from './core/browser';

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

    console.log(`Saved ${links.length} links to ${path.join(config.outputDir, 'All_links.md')}`);
  } catch (error) {
    console.error('Crawler failed:', error);
    process.exit(1);
  } finally {
    await closeBrowser();
  }
};

void main();
