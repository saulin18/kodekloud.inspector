export type LinkInfo = {
  href: string;
  text: string;
};

export interface NavigationItem {
  text: string;
  href: string | null;
  children?: NavigationItem[];
}

export interface PageContent {
  title: string;
  url: string;
  content: string;
  headings: Array<{ level: number; text: string }>;
  links: Array<{ href: string; text: string }>;
  navigation?: NavigationItem[];
}
