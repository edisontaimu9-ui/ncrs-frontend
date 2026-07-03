import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { session, profile, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const name = profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email || "User";
  const role = profile?.role || "Clinician";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const NAV = [
    { to: "/dashboard", label: "Dashboard", icon: "⊞" },
    { to: "/patients", label: "Patients", icon: "♥" },
    { to: "/new-patient", label: "New Patient", icon: "+" },
    { to: "/adime", label: "ADIME Notes", icon: "✎" },
    { to: "/reports", label: "Reports", icon: "⊟" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin Panel", icon: "⚙" }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`${collapsed ? "w-16" : "w-56"} bg-[#0F4C3A] flex flex-col transition-all duration-200 min-h-screen`}>
        <div className="px-4 py-5 flex items-center gap-3 border-b border-emerald-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-400 flex items-center justify-center flex-shrink-0">
            <span className="text-[#0F4C3A] font-bold text-sm">N</span>
          </div>
          {!collapsed && <div><p className="text-white font-semibold text-sm">NCRS</p><p className="text-emerald-300 text-xs">Nutrition Registry</p></div>}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-emerald-700 text-white font-medium" : "text-emerald-100 hover:bg-emerald-800"}`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-emerald-800 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{name}</p>
                <p className="text-emerald-300 text-xs capitalize">{role}</p>
              </div>
            </div>
          )}
          <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-emerald-100 hover:bg-emerald-800 text-sm transition-colors">
            <span className="flex-shrink-0">⎋</span>
            {!collapsed && <span>Sign out</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-emerald-100 hover:bg-emerald-800 text-sm transition-colors">
            <span className="flex-shrink-0">{collapsed ? "→" : "←"}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}
