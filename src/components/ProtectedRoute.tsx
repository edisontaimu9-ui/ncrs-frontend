import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PendingApproval from "../pages/PendingApproval";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  );

  if (!session) return <Navigate to="/auth" replace />;
  if (!profile || profile.status === "pending") return <PendingApproval />;
  if (profile.status === "rejected") return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-xl font-bold text-slate-800 mb-2">Account Rejected</p>
        <p className="text-slate-500 text-sm">Contact your system administrator.</p>
      </div>
    </div>
  );

  return <>{children}</>;
}
