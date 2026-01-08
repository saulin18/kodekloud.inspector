import { crawlLinks } from './crawler/links';
import { config } from './config';

const main = async () => {
  try {
    const links = await crawlLinks(config.baseUrl);
    console.log(links);
  } catch (error) {
    console.error('Crawler failed:', error);
    process.exitCode = 1;
  }
};

void main();
