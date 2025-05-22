import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from './config';
import { authMiddleware } from './middleware/authMiddleware';

export const configureRoutes = (router: Router) => {
  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'api-gateway' });
  });

  // Authentication Service Routes
  router.use(
    '/auth',
    createProxyMiddleware({
      target: config.services.auth,
      changeOrigin: true,
      pathRewrite: { '^/auth': '' }, // Remove /auth prefix
    })
  );

  // User Service Routes
  router.use(
    '/api/users',
    authMiddleware, // Apply auth for protected routes
    createProxyMiddleware({
      target: config.services.user,
      changeOrigin: true,
      pathRewrite: { '^/api/users': 'users/' },
    })
  );

  // Partner Service Routes
  router.use(
    '/api/partners',
    createProxyMiddleware({
      target: config.services.partner,
      changeOrigin: true,
      pathRewrite: { '^/api/partners/drivers': '/drivers' },
    })
  );

  router.use(
    '/api/ratings',
    authMiddleware,
    createProxyMiddleware({
      target: config.services.partner,
      changeOrigin: true,
      pathRewrite: { '^/api/ratings': 'ratings/' },
    })
  );

  // Order Service Routes
  router.use(
    '/api/vehicles',
    createProxyMiddleware({
      target: config.services.order,
      changeOrigin: true,
      pathRewrite: { '^/api/vehicles': 'admin/vehicles/' },
    })
  );

  router.use(
    '/api/orders',
    createProxyMiddleware({
      target: config.services.order,
      changeOrigin: true,
      pathRewrite: { '^/api/orders': 'orders/' },
    })
  );

  router.use(
    '/api/wallet',
    createProxyMiddleware({
      target: config.services.order,
      changeOrigin: true,
      pathRewrite: { '^/api/wallet': 'wallet/' },
    })
  );


  router.use(
    '/api/active-orders/',
    authMiddleware,
    createProxyMiddleware({
      target: config.services.order,
      changeOrigin: true,
      pathRewrite: { '^/api/active-orders/': 'active-orders/' },
    })
  );

  return router;
};