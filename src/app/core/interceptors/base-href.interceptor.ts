import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Prefixes root-absolute API requests (/api/...) with the app's base href so
 * they resolve correctly when the app is served under a sub-path (e.g.
 * /matchwiz/). In dev (base href "/") requests are left untouched, so MSW mock
 * handlers registered on /api/... keep matching.
 */
export const baseHrefInterceptor: HttpInterceptorFn = (req, next) => {
  const baseHref = inject(DOCUMENT).querySelector('base')?.getAttribute('href') ?? '/';
  if (baseHref !== '/' && req.url.startsWith('/api/')) {
    const prefix = baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
    return next(req.clone({ url: `${prefix}${req.url}` }));
  }
  return next(req);
};
