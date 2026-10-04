import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { createSiteRouter } from '@pf/ui';
import { portfolioRoutes } from '@pf/portfolio';
import { projectsRoutes } from '@pf/projects';
import { blogRoutes } from '@pf/blog';

/** The main host: every site under one domain (/, /projects, /blog). */
const router = createSiteRouter([
  ['portfolio', portfolioRoutes],
  ['projects', projectsRoutes],
  ['blog', blogRoutes],
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
