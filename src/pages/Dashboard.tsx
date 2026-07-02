import { supabase } from "../lib/supabase";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">You are logged in.</p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="bg-[#0F4C3A] text-white px-6 py-2 rounded-xl text-sm font-semibold"
      >
        Sign out
      </button>
    </div>
  );
}
