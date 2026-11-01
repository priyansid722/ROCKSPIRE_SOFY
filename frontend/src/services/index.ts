/*
 * services/index.ts — Service registry
 *
 * Reads the VITE_USE_MOCK_API env var and exports the correct
 * implementation for each service. Components import from here.
 *
 * Usage:
 *   import { authService, profileService, projectService } from '@/services';
 */

import { mockAuthService } from './mock/mockAuth';
import { mockProfileService } from './mock/mockProfile';
import { mockProjectService } from './mock/mockProject';
import {
  realAuthService,
  realProfileService,
  realProjectService,
} from './real';

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const authService = useMock ? mockAuthService : realAuthService;
export const profileService = useMock ? mockProfileService : realProfileService;
export const projectService = useMock ? mockProjectService : realProjectService;

/** Exported so components can show a warning when mock mode is on */
export const IS_MOCK_MODE = useMock;
