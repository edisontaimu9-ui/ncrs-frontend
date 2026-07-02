import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/patients", label: "Patients", icon: "♥" },
  { to: "/new-patient", label: "New Patient", icon: "+" },
  { to: "/adime", label: "ADIME Notes", icon: "✎" },
  { to: "/reports", label: "Reports", icon: "⊟" },
];

export default function Layout() {
  const { session } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const name = session?.user?.user_metadata?.full_name || session?.user?.email || "User";
  const role = session?.user?.user_metadata?.role || "Clinician";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-56"} bg-[#0F4C3A] flex flex-col transition-all duration-200 min-h-screen`}>
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-emerald-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-400 flex items-center justify-center flex-shrink-0">
            <span className="text-[#0F4C3A] font-bold text-sm">N</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-semibold text-sm">NCRS</p>
              <p className="text-emerald-300 text-xs">Nutrition Registry</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-emerald-700 text-white font-medium"
                    : "text-emerald-100 hover:bg-emerald-800"
                }`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-2 py-4 border-t border-emerald-800 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{name}</p>
                <p className="text-emerald-300 text-xs">{role}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-emerald-100 hover:bg-emerald-800 text-sm transition-colors"
          >
            <span className="flex-shrink-0">⎋</span>
            {!collapsed && <span>Sign out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-emerald-100 hover:bg-emerald-800 text-sm transition-colors"
          >
            <span className="flex-shrink-0">{collapsed ? "→" : "←"}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
