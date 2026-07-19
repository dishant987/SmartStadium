import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastContainer } from "@/components/ui/Toast";

function SkipNav() {
  return (
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-pitch-green-500 focus:text-white focus:rounded-fan">
      Skip to main content
    </a>
  );
}

const Landing = lazy(() => import("@/pages/Landing").then(m => ({ default: m.Landing })));
const ChatPage = lazy(() => import("@/pages/ChatPage").then(m => ({ default: m.ChatPage })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const WayfindingPage = lazy(() => import("@/pages/WayfindingPage").then(m => ({ default: m.WayfindingPage })));
const PAPage = lazy(() => import("@/pages/PAPage").then(m => ({ default: m.PAPage })));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const VolunteerPage = lazy(() => import("@/pages/VolunteerPage").then(m => ({ default: m.VolunteerPage })));
const VolunteerRegisterPage = lazy(() => import("@/pages/VolunteerRegisterPage").then(m => ({ default: m.VolunteerRegisterPage })));
const EvacuationPage = lazy(() => import("@/pages/EvacuationPage").then(m => ({ default: m.EvacuationPage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-pitch-night"><span className="text-text-muted">Loading…</span></div>}>{children}</Suspense>;
}

function AppRoutes() {
  return (
    <>
      <main id="main-content">
        <Routes>
          <Route path="/" element={<SuspenseWrapper><Landing /></SuspenseWrapper>} />
          <Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
          <Route path="/profile" element={<ProtectedRoute><SuspenseWrapper><ProfilePage /></SuspenseWrapper></ProtectedRoute>} />
          <Route path="/chat/:sessionId?" element={<ProtectedRoute><SuspenseWrapper><ChatPage /></SuspenseWrapper></ProtectedRoute>} />
          <Route path="/evacuation" element={<ProtectedRoute><SuspenseWrapper><EvacuationPage /></SuspenseWrapper></ProtectedRoute>} />
          <Route path="/wayfinding" element={<ProtectedRoute><SuspenseWrapper><WayfindingPage /></SuspenseWrapper></ProtectedRoute>} />
          <Route path="/pa" element={<ProtectedRoute><SuspenseWrapper><PAPage /></SuspenseWrapper></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><SuspenseWrapper><AnalyticsPage /></SuspenseWrapper></ProtectedRoute>} />
          <Route path="/volunteer" element={<ProtectedRoute><SuspenseWrapper><VolunteerPage /></SuspenseWrapper></ProtectedRoute>} />
          <Route path="/volunteer/register" element={<ProtectedRoute><SuspenseWrapper><VolunteerRegisterPage /></SuspenseWrapper></ProtectedRoute>} />
        </Routes>
      </main>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SkipNav />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
