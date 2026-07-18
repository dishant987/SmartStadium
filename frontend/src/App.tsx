import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Landing } from "@/pages/Landing";
import { ChatPage } from "@/pages/ChatPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { WayfindingPage } from "@/pages/WayfindingPage";
import { PAPage } from "@/pages/PAPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ToastContainer } from "@/components/ui/Toast";

const EvacuationPage = lazy(async () => { const m = await import("@/pages/EvacuationPage"); return { default: m.EvacuationPage }; });

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:sessionId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/evacuation" element={<ProtectedRoute><SuspenseWrapper><EvacuationPage /></SuspenseWrapper></ProtectedRoute>} />
        <Route path="/wayfinding" element={<ProtectedRoute><WayfindingPage /></ProtectedRoute>} />
        <Route path="/pa" element={<ProtectedRoute><PAPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      </Routes>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
