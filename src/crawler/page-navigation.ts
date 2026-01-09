import { createPage } from '../core/browser';
import { NavigationItem } from '../types';
import { extractNavItems } from './content';

export const crawlPageContentNavigation = async (url: string): Promise<NavigationItem[]> => {
  const page = await createPage();

  await page.goto(url);
  const navListLocator = page.locator('ul[role="list"]').first();
  const navListCount = await navListLocator.count();

  if (navListCount > 0) {
    console.log('Navigation list found');
    return extractNavItems(navListLocator);
  } else {
    console.log('No navigation list found');
    return [];
  }
};
