import { useState } from "react";
import { supabase } from "../lib/supabase";

const ROLES = ["Clinician", "Student", "Admin"];

interface FormState {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState<FormState>({ email: "", password: "", fullName: "", role: "Clinician" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, role: form.role },
      },
    });
    if (error) setError(error.message);
    else setSuccess("Account created. Check your email to confirm before logging in.");
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (mode === "register" && !form.fullName) { setError("Full name is required."); return; }
    mode === "login" ? handleLogin() : handleRegister();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#0F4C3A] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-400 flex items-center justify-center">
            <span className="text-[#0F4C3A] font-bold text-sm">N</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm tracking-wide">NCRS</p>
            <p className="text-emerald-300 text-xs">Nutrition Care Registry System</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === "login"
              ? "Sign in to access patient records."
              : "Register to join your nutrition team."}
          </p>
        </div>

        <div className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={update("fullName")}
                placeholder="e.g. Chisomo Banda"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@facility.org"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
              <select
                value={form.role}
                onChange={update("role")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <p className="text-emerald-700 text-xs">{success}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#0F4C3A] hover:bg-[#0a3629] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          {mode === "login" && (
            <button
              onClick={async () => {
                if (!form.email) { setError("Enter your email first."); return; }
                setError("");
                await supabase.auth.resetPasswordForEmail(form.email);
                setSuccess("Password reset link sent to your email.");
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-emerald-700 transition-colors"
            >
              Forgot password?
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-emerald-700 font-semibold hover:underline"
            >
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      <div className="px-6 py-4 text-center">
        <p className="text-xs text-slate-400">© 2026 Taimu Tech Solutions · Blantyre, Malawi</p>
      </div>
    </div>
  );
}
