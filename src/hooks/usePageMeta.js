import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE_META, SITE } from '../config/site';

const setMeta = (selector, attribute, value) => {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
};

export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = PAGE_META[pathname] || PAGE_META['/'];
    document.title = meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
    setMeta('link[rel="canonical"]', 'href', `${SITE.domain}${pathname === '/' ? '' : pathname}`);
  }, [pathname]);
}
