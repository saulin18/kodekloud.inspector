import { LinkInfo } from '../types';
import { md } from '../utils/md-builder';

export const buildAllLinksMarkdown = async (header: string, links: LinkInfo[]) => {
  if (!links.length) {
    return md.build([md.header(header, 1), md.italic('No links found.')]);
  }

  const list = md.unordered(links.map((link) => md.link(link.text || link.href, link.href || '#')));
  return md.build([md.header(header, 1), list]);
};
