import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname === '/index.html') {
    return context.rewrite('/');
  }
  return next();
});
