/*
 * App.tsx — Root component and router configuration
 *
 * Sets up:
 *  - AuthProvider (wraps everything — provides login/logout/session state)
 *  - BrowserRouter + Routes
 *  - ProtectedRoute for auth-gated pages
 *  - All seven routes + 404 + Terms + Contact
 *
 * Navigation flow:
 *   / (Landing) → /login → /profile (protected)
 *   / → /register → /profile (protected)
 *   /profile → /profile/edit (protected)
 *   /profile → /projects/new (protected)
 *   /projects/:projectId (protected) ← from profile card
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ── Pages ─────────────────────────────────────────────────────────────
import { Landing }          from '@/pages/Landing';
import { Login }            from '@/pages/Login';
import { Register }         from '@/pages/Register';
import { Profile }          from '@/pages/Profile';
import { ProfileEdit }      from '@/pages/ProfileEdit';
import { NewProject }       from '@/pages/NewProject';
import { ProjectWorkspace } from '@/pages/ProjectWorkspace';
import { NotFound }         from '@/pages/NotFound';
import { Terms }            from '@/pages/Terms';
import { Contact }          from '@/pages/Contact';

export default function App() {
  return (
    /*
     * AuthProvider must be OUTSIDE BrowserRouter so that protected routes
     * can read the session and redirect before rendering any page content.
     */
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ──────────────────────────────────── */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms"    element={<Terms />} />
          <Route path="/contact"  element={<Contact />} />

          {/* ── Protected routes (redirect to /login if not authed) ── */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <NewProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectWorkspace />
              </ProtectedRoute>
            }
          />

          {/* ── 404 — must be last ──────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
