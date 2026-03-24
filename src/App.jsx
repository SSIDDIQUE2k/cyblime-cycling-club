import './App.css'
import { Suspense, lazy } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import FloatingThemeToggle from '@/components/FloatingThemeToggle';

const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : () => <></>;

// Pages anyone can see without logging in
const PUBLIC_PAGES = new Set([
  "Home", "About", "Events", "Membership", "Blog", "BlogPost",
  "AuthorPosts", "Gallery", "Routes", "RouteDetails", "CyclingHub",
  "StravaClub", "Challenges", "Leaderboard", "Login"
]);

// Shared loading spinner for lazy page loads
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[var(--cy-bg)]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin"></div>
      <p className="text-[var(--cy-text-muted)] text-sm">Loading...</p>
    </div>
  </div>
);

// Persistent layout — stays mounted across all route changes
const PersistentLayout = () => {
  return Layout ? (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  ) : (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

// Wrapper that enforces auth on protected pages
const ProtectedRoute = ({ pageName, children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  // Public pages render immediately
  if (PUBLIC_PAGES.has(pageName)) return children;

  // Protected page — show loader while checking auth
  if (isLoadingAuth) return <PageLoader />;

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* All pages share the same Layout — it never unmounts on navigation */}
      <Route element={<PersistentLayout />}>
        <Route path="/" element={<MainPage />} />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <ProtectedRoute pageName={path}>
                <Page />
              </ProtectedRoute>
            }
          />
        ))}
        <Route path="/AdminUserManagement" element={
          <ProtectedRoute pageName="AdminUserManagement">
            <AdminUserManagement />
          </ProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AppRoutes />
            <FloatingThemeToggle />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
