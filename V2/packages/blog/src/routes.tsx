import { lazy, Suspense, type ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { PageLoading } from '@pf/ui';
import { BlogPage } from './BlogPage';
import { BlogPathPage } from './BlogPathPage';

// The admin (and its rich-text editor) is only downloaded by the owner.
const SignInPage = lazy(() => import('./admin/SignInPage').then((m) => ({ default: m.SignInPage })));
const DashboardPage = lazy(() => import('./admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const EditorPage = lazy(() => import('./admin/EditorPage').then((m) => ({ default: m.EditorPage })));
const RequireAdmin = lazy(() => import('./admin/AdminShell').then((m) => ({ default: m.RequireAdmin })));

const admin = (page: ReactNode) => (
  <Suspense fallback={<PageLoading />}>
    <RequireAdmin>{page}</RequireAdmin>
  </Suspense>
);

export const blogRoutes: RouteObject[] = [
  { index: true, element: <BlogPage /> },
  { path: 'admin/sign-in', element: <Suspense fallback={<PageLoading />}><SignInPage /></Suspense> },
  { path: 'admin', element: admin(<DashboardPage />) },
  { path: 'admin/new', element: admin(<EditorPage />) },
  { path: 'admin/edit/:slug', element: admin(<EditorPage />) },
  // /blog/<slug>, /blog/<folder>/<slug>, /blog/<folder>
  { path: '*', element: <BlogPathPage /> },
];
