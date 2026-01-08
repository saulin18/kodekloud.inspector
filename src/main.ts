import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { crawlLinks } from './crawler/links';
import { scrapePageContent } from './crawler/content';
import { config } from './config';
import { buildAllLinksMarkdown } from './app/links';
import { buildPageContentMarkdown } from './app/content';
import { closeBrowser } from './core/browser';

const main = async () => {
  try {
    // Get target URL from environment or use default
    const targetUrl = process.env.TARGET_URL || config.baseUrl;

    // If TARGET_URL is set and is a full URL, scrape that specific page
    if (process.env.TARGET_URL && targetUrl.startsWith('http')) {
      console.log(`Scraping content from: ${targetUrl}`);

      const pageContent = await scrapePageContent(targetUrl, config.includeNavigation);

      // Create a safe filename from the URL
      const urlPath = new URL(targetUrl).pathname.replace(/\//g, '_').replace(/^_/, '') || 'page';
      const filename = `${urlPath}.md`;

      const markdown = await buildPageContentMarkdown(pageContent);

      await writeFile(path.join(config.outputDir, filename), markdown);

      console.log(`Saved page content to ${path.join(config.outputDir, filename)}`);
      console.log(`Title: ${pageContent.title}`);
      console.log(`Headings found: ${pageContent.headings.length}`);
      console.log(`Links found: ${pageContent.links.length}`);
    } else {
      // Original behavior: crawl links
      console.log(`Crawling links from: ${targetUrl}`);

      const links = await crawlLinks(
        targetUrl,
        // get only docs links
        ({ href }) => href.startsWith('/docs'),
      );

      await writeFile(
        path.join(config.outputDir, 'All_links.md'),
        await buildAllLinksMarkdown('All links in ' + targetUrl, links),
      );

      console.log(`Saved ${links.length} links to ${path.join(config.outputDir, 'All_links.md')}`);
    }
  } catch (error) {
    console.error('Crawler failed:', error);
    process.exit(1);
  } finally {
    await closeBrowser();
  }
};

void main();
