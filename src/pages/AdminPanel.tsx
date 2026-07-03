import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface PendingUser {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  email?: string;
}

interface Facility {
  id: string;
  name: string;
  district: string;
}

const ROLES = ["dietitian", "doctor", "nurse", "facility_admin", "district_supervisor", "super_admin"];

export default function AdminPanel() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingUser | null>(null);
  const [assignRole, setAssignRole] = useState("dietitian");
  const [assignFacility, setAssignFacility] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"pending" | "all">("pending");

  useEffect(() => {
    Promise.all([
      supabase.from("user_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("facilities").select("*").order("name"),
    ]).then(([usersRes, facRes]) => {
      if (usersRes.data) setUsers(usersRes.data);
      if (facRes.data) setFacilities(facRes.data);
      setLoading(false);
    });
  }, []);

  const handleApprove = async () => {
    if (!selected || !assignFacility) return;
    setSaving(true);
    await supabase.from("user_profiles").update({ role: assignRole, status: "active" }).eq("user_id", selected.user_id);
    await supabase.from("user_facilities").upsert({ user_id: selected.user_id, facility_id: assignFacility, is_primary: true });
    setUsers((u) => u.map((p) => p.user_id === selected.user_id ? { ...p, role: assignRole, status: "active" } : p));
    setSelected(null);
    setSaving(false);
  };

  const handleReject = async (userId: string) => {
    await supabase.from("user_profiles").update({ status: "rejected" }).eq("user_id", userId);
    setUsers((u) => u.map((p) => p.user_id === userId ? { ...p, status: "rejected" } : p));
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const filtered = tab === "pending" ? users.filter((u) => u.status === "pending") : users;

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage users and facility assignments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["pending", "all"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? "bg-[#0F4C3A] text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
            {t === "pending" ? `Pending (${users.filter(u => u.status === "pending").length})` : "All Users"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-sm">{tab === "pending" ? "No pending approvals." : "No users yet."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl border border-slate-200 px-4 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{u.full_name || "Unknown"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{u.role} · Registered {fmt(u.created_at)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  u.status === "active" ? "bg-emerald-100 text-emerald-700" :
                  u.status === "pending" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-500"
                }`}>{u.status}</span>
              </div>
              {u.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setSelected(u); setAssignRole("dietitian"); setAssignFacility(""); }} className="flex-1 py-2 rounded-xl bg-[#0F4C3A] text-white text-xs font-semibold">Approve</button>
                  <button onClick={() => handleReject(u.user_id)} className="flex-1 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-slate-800 mb-1">Approve {selected.full_name}</h3>
            <p className="text-slate-500 text-xs mb-4">Assign a facility and role to activate this account.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Facility</label>
                <select value={assignFacility} onChange={(e) => setAssignFacility(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select facility</option>
                  {facilities.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.district}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <select value={assignRole} onChange={(e) => setAssignRole(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
              <button onClick={handleApprove} disabled={saving || !assignFacility} className="flex-1 py-2.5 rounded-xl bg-[#0F4C3A] text-white text-sm font-semibold disabled:opacity-60">
                {saving ? "Saving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
