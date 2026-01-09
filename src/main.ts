import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { crawlLinks } from './crawler/links';
import { config } from './config';
import { buildAllLinksMarkdown } from './app/links';
import { closeBrowser } from './core/browser';
import { getErrorsRegistryOfCourses, writeCourse } from './app/course';
import { LinkInfo } from './types';
import { splitBatches } from './utils/batch';

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

    // Apply max courses limit if set
    const maxCourses =
      config.maxCourses > 0 ? Math.min(config.maxCourses, links.length) : links.length;
    const limitedLinks = links.slice(0, maxCourses);

    console.log(`Processing ${maxCourses} of ${links.length} available courses`);

    // Process each batch in parallel
    let completed = 0;
    await Promise.all(
      splitBatches(limitedLinks).map(async (batch: LinkInfo[], index: number) => {
        for (const link of batch) {
          console.debug(`- Batch [${index + 1}]: Start course ${link.href}`);
          await writeCourse(link);
          console.debug(`- Batch [${index + 1}]: Completed ${link.href}`);
          completed++;
          console.debug(`- Completed ${completed}/${maxCourses} courses`);
        }
      }),
    );

    // report accumulated errors
    console.log('Errors: ', getErrorsRegistryOfCourses().length);
    getErrorsRegistryOfCourses().forEach((e, i) => console.warn('Error ' + ++i, e));
  } catch (error) {
    console.error('Crawler failed:', error);
    //process.exit(1);
  } finally {
    //try {
    //  await closeBrowser();
    //} catch {}
    process.exit(0);
  }
};

void main();
