import 'dotenv/config';

export const config = {
  executablePath: process.env.EXECUTABLE_PATH,
  baseUrl: process.env.BASE_URL || '',
  headless: process.env.HEADLESS === 'true',
};
