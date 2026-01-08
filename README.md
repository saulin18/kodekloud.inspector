# KodeKloud Inspector

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)

A web scraping template project that extracts all docs from the KodeKloud website and saves them as structured markdown files.

Target website: https://notes.kodekloud.com/

> **Status**: This is a work-in-progress template

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
pnpm exec playwright install
```

### 2. Configure Environment

Create `.env` file or clone from `.env.example`

```env
BASE_URL=https://notes.kodekloud.com
HEADLESS=true
```

### 3. Run the Scraper

```bash
pnpm scrape
```

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
