import { createPage } from '../core/browser';
import { LinkInfo } from '../types';

export const crawlLinks = async (url: string, filterCallback = (_: LinkInfo) => true) => {
  const page = await createPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const linksLocator = await page.locator('a').all();
    const links: LinkInfo[] = [];

    for (const link of linksLocator) {
      const data = {
        href: (await link.getAttribute('href'))?.trim() || '',
        text: (await link.textContent())?.trim() || '',
      };
      if (filterCallback(data)) {
        links.push(data);
      }
    }

    return links;
  } finally {
    await page.close();
  }
};
