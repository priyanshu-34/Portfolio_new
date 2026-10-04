import type { RouteObject } from 'react-router-dom';
import { HomePage } from './HomePage';

export const portfolioRoutes: RouteObject[] = [{ index: true, element: <HomePage /> }];
