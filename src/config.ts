import 'dotenv/config';
import path from 'node:path';

export const config = {
  executablePath: process.env.EXECUTABLE_PATH,
  baseUrl: process.env.BASE_URL || 'https://notes.kodekloud.com',
  headless: process.env.HEADLESS === 'true',
  includeNavigation: process.env.INCLUDE_NAVIGATION === 'true' || true,
  outputDir: path.join(__dirname, '../output'),
};
