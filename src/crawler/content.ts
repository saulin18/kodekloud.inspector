import { createPage } from '../core/browser';
import { PageContent, NavigationItem } from '../types';
import type { Locator } from 'playwright';
import { CrawlerError } from '../types/error';

export const scrapePageContent = async (url: string): Promise<PageContent> => {
  const page = await createPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Extract title
    const title = await page.title();

    // Find the article element
    const articleElement = page.locator('article').first();
    const articleExists = (await articleElement.count()) > 0;

    if (!articleExists) {
      throw new CrawlerError('Article not found');
    }

    // Extract content from article
    const htmlContent = (await articleElement.innerHTML()) || '';

    // Extract headings only from the article
    const headings: Array<{ level: number; text: string }> = [];
    for (let level = 1; level <= 6; level++) {
      const headingElements = await articleElement.locator(`h${level}`).all();
      for (const heading of headingElements) {
        const text = await heading.textContent();
        if (text && text.trim()) {
          headings.push({ level, text: text.trim() });
        }
      }
    }
    console.log('Headings found in article:', headings.length);
    console.log('Headings:', headings.map((h) => `h${h.level}: ${h.text}`).join('\n'));

    // Extract links only from the article
    const links: Array<{ href: string; text: string }> = [];

    const linkElements = await articleElement.locator('a').all();
    for (const link of linkElements) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      if (href && text && text.trim()) {
        links.push({ href: href.trim(), text: text.trim() });
      }
    }
    console.log('Links found in article:', links.length);
    console.log('Links:', links.map((l) => `${l.text} -> ${l.href}`).join('\n'));

    return {
      title: title.trim(),
      url,
      htmlContent: htmlContent.trim(),
      headings,
      links,
    };
  } finally {
    await page.close();
  }
};

export const extractNavItems = async (ulLocator: Locator): Promise<NavigationItem[]> => {
  const items: NavigationItem[] = [];
  const listItems = await ulLocator.locator('> li').all();
  console.log('List items:', listItems.length);

  for (const li of listItems) {
    const button = li.locator('button').first();
    const link = li.locator('a').first();
    const nestedUl = li.locator('ul[role="list"]').first();

    const buttonCount = await button.count();
    const linkCount = await link.count();

    if (buttonCount > 0) {
      await button.click();
      await button.page().waitForTimeout(1000);
      const nestedUlCount = await nestedUl.count();

      const h3 = button.locator('h3').first();
      const h3Count = await h3.count();
      let text = '';
      if (h3Count > 0) {
        text = (await h3.textContent())?.trim() || '';
      } else {
        text = (await button.textContent())?.trim() || '';
      }

      const navItem: NavigationItem = { text, href: null };

      if (nestedUlCount > 0) {
        navItem.children = await extractNavItems(nestedUl);
      }

      items.push(navItem);
    } else if (linkCount > 0) {
      const nestedUlCount = await nestedUl.count();
      const href = await link.getAttribute('href');
      const text = (await link.textContent())?.trim() || '';

      const navItem: NavigationItem = { text, href };

      if (nestedUlCount > 0) {
        navItem.children = await extractNavItems(nestedUl);
      }

      items.push(navItem);
    }
  }

  return items;
};
