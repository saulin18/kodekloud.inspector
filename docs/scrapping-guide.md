First of all, in the crawler folder we have the scraping files. The `content.ts` file is used for scraping the content of a page.

In https://notes.kodekloud.com (for example: https://notes.kodekloud.com/docs/AWS-Solutions-Architect-Associate-Certification) we have the main content in an `article` tag.

Example:

```html
<article>
  <header>
    <p>AWS Solutions Architect Associate Certification</p>
    <p>Introduction</p>
    <h1>Course Overview</h1>
    <!-- main content here -->
  </header>
</article>
```

![Article structure example](../src/screenshots/course-article-example.png)

And this is why we have:

```typescript
export const scrapePageContent = async (
  url: string,
  includeNavigation = false,
): Promise<PageContent> => {
  const page = await createPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Extract title
    const title = await page.title();

    // Find the article element
    const articleElement = page.locator('article').first();
    const articleExists = (await articleElement.count()) > 0;

    if (!articleExists) {
      throw new Error('No article element found on the page');
    }
    ...

```

Another important thing is the navigation links of the course classes.

The HTML structure we see is the following:

```html
<nav>
  <ul role="list">
    <li>
      <button>
        <h3>Introduction</h3>
      </button>
      <ul role="list">
        <li>
          <a
            href="/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Course-Overview"
          >
            Course Overview
          </a>
        </li>
        <li>
          <a
            href="/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Why-take-this-course"
          >
            Why take this course
          </a>
        </li>
        <li>
          <a
            href="/docs/AWS-Solutions-Architect-Associate-Certification/Introduction/Course-Introduction-prerequistites-details-audience-outcomes-structure-and-more"
          >
            Course Introduction prerequistites details audience outcomes structure and more
          </a>
        </li>
        <!-- more links... -->
      </ul>
    </li>
    <li>
      <button>
        <h3>Services Networking</h3>
      </button>
    </li>
    <li>
      <button>
        <h3>Services Storage</h3>
      </button>
    </li>
    <li>
      <button>
        <h3>Services Compute</h3>
      </button>
    </li>
    <!-- more sections... -->
  </ul>
</nav>
```

![Navigation sidebar structure example](../src/screenshots/classes-sidebar-ul-example.png)

```typescript
const extractNavItems = async (ulLocator: Locator): Promise<NavigationItem[]> => {
  const items: NavigationItem[] = [];
  const listItems = await ulLocator.locator('> li').all();
  console.log('List items:', listItems.length);

  for (const li of listItems) {
    const button = li.locator('button').first();
    const link = li.locator('a').first();
    const nestedUl = li.locator('ul[role="list"]').first();

    const buttonCount = await button.count();
    const linkCount = await link.count();
    const nestedUlCount = await nestedUl.count();

    if (buttonCount > 0) {
      const h3 = button.locator('h3').first();
      const h3Count = await h3.count();
      let text = '';
      if (h3Count > 0) {
        text = (await h3.textContent())?.trim() || '';
      } else {
        text = (await button.textContent())?.trim() || '';
      }

      const navItem: NavigationItem = { text, href: null };

      if (nestedUlCount > 0) {
        navItem.children = await extractNavItems(nestedUl);
      }

      items.push(navItem);
    } else if (linkCount > 0) {
      const href = await link.getAttribute('href');
      const text = (await link.textContent())?.trim() || '';

      const navItem: NavigationItem = { text, href };

      if (nestedUlCount > 0) {
        navItem.children = await extractNavItems(nestedUl);
      }

      items.push(navItem);
    }
  }

  return items;
};
```

We also extract the headings and the links inside the article. They can be different from the navigation.
