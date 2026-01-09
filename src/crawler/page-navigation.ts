import { createPage, safeNavigate } from '../core/browser';
import { NavigationItem } from '../types';
import { extractNavItems } from './content';

export const crawlPageContentNavigation = async (url: string): Promise<NavigationItem[]> => {
  const page = await createPage();

  await safeNavigate(page, url);
  const navListLocator = page.locator('ul[role="list"]').first();
  const navListCount = await navListLocator.count();

  if (navListCount > 0) {
    return extractNavItems(navListLocator);
  } else {
    return [];
  }
};
