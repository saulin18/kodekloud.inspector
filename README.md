# KodeKloud Inspector

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)

A web scraping template project that extracts all docs from the KodeKloud website and saves them as structured markdown files.

Target website: https://notes.kodekloud.com/

> **Status**: This is a work-in-progress template

## 📚 Extracted Course Documentation

All courses have been successfully scraped and are available in the `/docs` directory:

**[View Scraped Course Documentation](https://github.com/rodnye/kodekloud.inspector/tree/output/markdown/docs)**

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
pnpm exec playwright install
```

### 2. Configure Environment

Create `.env` file in the root directory:

```env
BASE_URL=https://notes.kodekloud.com
HEADLESS=true
EXECUTABLE_PATH=
```

**To scrape a specific page**, add `TARGET_URL` to your `.env`:

```env
BASE_URL=https://notes.kodekloud.com
HEADLESS=true
EXECUTABLE_PATH=
TARGET_URL=https://notes.kodekloud.com/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Course-Overview
```

**To include navigation in the output** (useful for extracting the sidebar navigation structure), add `INCLUDE_NAVIGATION=true`:

```env
BASE_URL=https://notes.kodekloud.com
HEADLESS=true
EXECUTABLE_PATH=
TARGET_URL=https://notes.kodekloud.com/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Course-Overview
INCLUDE_NAVIGATION=true
```

> **Note**: The navigation is extracted once and included in the markdown output. This is useful because the navigation structure is the same across different articles.

### 3. Run the Scraper

**Scrape a specific page:**
```bash
# Set TARGET_URL in .env, then:
pnpm scrape
```

**Or scrape all links (default behavior when TARGET_URL is not set):**
```bash
pnpm scrape
```

The output will be saved in the `output/` directory.

> [!warning]
> This project is for **educational purposes only**. It demonstrates:
>
> - Web scraping fundamentals
> - Github Actions automation
> - Browser automation with Playwright
>
> Always respect website terms of service and robots.txt files when scraping.

---

_Educational template for learning web scraping and TypeScript development :)_