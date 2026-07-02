import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Stats {
  total: number;
  active: number;
  discharged: number;
  today: number;
}

interface RecentPatient {
  id: string;
  full_name: string;
  ward: string;
  status: string;
  admission_date: string;
}

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, discharged: 0, today: 0 });
  const [recent, setRecent] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);

  const name = session?.user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      supabase.from("patients").select("id, status, admission_date"),
      supabase.from("patients").select("id, full_name, ward, status, admission_date").order("created_at", { ascending: false }).limit(5),
    ]).then(([statsRes, recentRes]) => {
      if (statsRes.data) {
        const all = statsRes.data;
        setStats({
          total: all.length,
          active: all.filter((p) => p.status === "Active").length,
          discharged: all.filter((p) => p.status === "Discharged").length,
          today: all.filter((p) => p.admission_date === today).length,
        });
      }
      if (recentRes.data) setRecent(recentRes.data);
      setLoading(false);
    });
  }, []);

  const STAT_CARDS = [
    { label: "Total Patients", value: stats.total, color: "bg-slate-800", text: "text-white" },
    { label: "Active", value: stats.active, color: "bg-emerald-600", text: "text-white" },
    { label: "Discharged", value: stats.discharged, color: "bg-white border border-slate-200", text: "text-slate-800" },
    { label: "Admitted Today", value: stats.today, color: "bg-white border border-slate-200", text: "text-slate-800" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">{greeting}, {name} 👋</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className={`${card.color} rounded-2xl p-4`}>
              <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
              <p className={`text-xs mt-1 ${card.text} opacity-70`}>{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/new-patient")} className="bg-[#0F4C3A] text-white rounded-2xl p-4 text-left hover:bg-[#0a3629] transition-colors">
            <span className="text-2xl">+</span>
            <p className="text-sm font-semibold mt-2">New Patient</p>
            <p className="text-xs text-emerald-300 mt-0.5">Register patient</p>
          </button>
          <button onClick={() => navigate("/patients")} className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:bg-slate-50 transition-colors">
            <span className="text-2xl">♥</span>
            <p className="text-sm font-semibold mt-2 text-slate-800">Patient Registry</p>
            <p className="text-xs text-slate-400 mt-0.5">View all patients</p>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent Patients</h2>
          <button onClick={() => navigate("/patients")} className="text-xs text-emerald-700 font-semibold hover:underline">View all</button>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}</div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">No patients yet.</p>
            <button onClick={() => navigate("/new-patient")} className="mt-2 text-emerald-700 text-sm font-semibold hover:underline">Register first patient →</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-50">
            {recent.map((p) => (
              <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.full_name}</p>
                  <p className="text-xs text-slate-400">{p.ward || "No ward"}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
