import 'dotenv/config';
import path from 'node:path';

export const config = {
  executablePath: process.env.EXECUTABLE_PATH,
  baseUrl: process.env.BASE_URL || '',
  headless: process.env.HEADLESS === 'true',
  outputDir: path.join(__dirname, '../output'),
};
