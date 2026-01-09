import { createPage, safeNavigate } from '../core/browser';
import { LinkInfo } from '../types';

export const crawlLinks = async (url: string, filterCallback = (_: LinkInfo) => true) => {
  const page = await createPage();

  try {
    await safeNavigate(page, url);

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
