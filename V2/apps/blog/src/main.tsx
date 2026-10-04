import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { createSiteRouter } from '@pf/ui';
import { blogRoutes } from '@pf/blog';

/** Standalone blog for its own subdomain (e.g. blog.example.com). */
const router = createSiteRouter([['blog', blogRoutes]]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
