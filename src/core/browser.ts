import { chromium, Browser, BrowserContext, Page, Response } from 'playwright';
import { config } from '../config';

let browserInstance: Browser | null = null;
let contextInstance: BrowserContext | null = null;
const navigationCache = new Map<string, Promise<Response | null>>();

export const getBrowser = async () => {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      executablePath: config.executablePath,
      headless: config.headless,
    });
  }

  return browserInstance;
};

export const getContext = async () => {
  if (!contextInstance) {
    const browser = await getBrowser();
    contextInstance = await browser.newContext();
  }

  return contextInstance;
};

export const createPage = async () => {
  const context = await getContext();
  return await context.newPage();
};

export const safeNavigate = async (
  page: Page,
  url: string,
  options?: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
    timeout?: number;
    retries?: number;
  },
) => {
  const { waitUntil = 'domcontentloaded', timeout = 30000, retries = 3 } = options || {};
  const cacheKey = `${url}`;

  if (navigationCache.has(cacheKey)) {
    console.warn(`[safeNavigate] Waiting for existing navigation to: ${url}`);
    return await navigationCache.get(cacheKey)!;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const navigationPromise = page.goto(url, { waitUntil, timeout });
      navigationCache.set(cacheKey, navigationPromise);

      // wait for it
      const response = await navigationPromise;
      navigationCache.delete(cacheKey);

      await page.waitForTimeout(200);

      return response;
    } catch (error) {
      lastError = error as Error;
      console.debug(
        `[safeNavigate] Attempt ${attempt}/${retries} failed for ${url}:`,
        lastError.message,
      );

      navigationCache.delete(cacheKey);

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));

        try {
          // close any problematic dialog
          page.once('dialog', async (dialog) => {
            await dialog.dismiss();
          });
        } catch {}
      }
    }
  }

  throw new Error(
    `[safeNavigate] Failed to navigate to ${url} after ${retries} attempts: ${lastError?.message}`,
  );
};

export function clearNavigationCache() {
  navigationCache.clear();
}

export const closeContext = async () => {
  if (contextInstance) {
    await contextInstance.close();
    contextInstance = null;
  }
};

export const closeBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};
