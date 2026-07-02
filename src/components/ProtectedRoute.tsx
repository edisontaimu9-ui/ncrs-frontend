import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  );

  if (!session) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
