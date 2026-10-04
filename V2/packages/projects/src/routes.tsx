import type { RouteObject } from 'react-router-dom';
import { ProjectsPage } from './ProjectsPage';
import { ProjectPage } from './ProjectPage';

export const projectsRoutes: RouteObject[] = [
  { index: true, element: <ProjectsPage /> },
  { path: ':slug', element: <ProjectPage /> },
];
