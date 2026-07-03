import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function PendingApproval() {
  const { session } = useAuth();
  const name = session?.user?.user_metadata?.full_name || "there";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-[#0F4C3A] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-400 flex items-center justify-center">
            <span className="text-[#0F4C3A] font-bold text-sm">N</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">NCRS</p>
            <p className="text-emerald-300 text-xs">Nutrition Care Registry System</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <span className="text-3xl">⏳</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Account Pending Approval</h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
          Hi {name}, your account has been created successfully. A system administrator will review and approve your account and assign you to your facility shortly.
        </p>
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 w-full max-w-sm text-left space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">What happens next</p>
          <div className="flex gap-3">
            <span className="text-emerald-600 font-bold text-sm">1</span>
            <p className="text-sm text-slate-600">Admin reviews your registration</p>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-600 font-bold text-sm">2</span>
            <p className="text-sm text-slate-600">You are assigned to your facility and role</p>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-600 font-bold text-sm">3</span>
            <p className="text-sm text-slate-600">You receive access to the registry</p>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-8 text-sm text-slate-400 hover:text-slate-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
