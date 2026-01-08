import { chromium, Browser, BrowserContext } from 'playwright';
import { config } from '../config';

let browserInstance: Browser | null = null;
let contextInstance: BrowserContext | null = null;

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
