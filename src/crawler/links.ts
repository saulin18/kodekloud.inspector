import { createPage } from '../core/browser';
import { LinkInfo } from '../types';

export const crawlLinks = async (url: string) => {
  const page = await createPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const linksLocator = await page.locator('a').all();
    const links: LinkInfo[] = [];

    for (const link of linksLocator) {
      links.push({
        href: (await link.getAttribute('href'))?.trim() || '',
        text: (await link.textContent())?.trim() || '',
      });
    }

    return links;
  } finally {
    await page.close();
  }
};
