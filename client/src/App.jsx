import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage.jsx";
import { CalendarPage } from "./pages/CalendarPage.jsx";
import { ErrorBoundary } from "./ui/ErrorBoundary.jsx";
import { LoadingScreen } from "./ui/LoadingScreen.jsx";
import { useAuth } from "./state/useAuth.jsx";

function ProtectedRoute({ children }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
