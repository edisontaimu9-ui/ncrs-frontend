import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface WardCount { ward: string; count: number; }
interface RecentNote { id: string; patient_name: string; created_at: string; created_by: string; assessment: string; }

export default function Reports() {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [discharged, setDischarged] = useState(0);
  const [wards, setWards] = useState<WardCount[]>([]);
  const [notes, setNotes] = useState<RecentNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("patients").select("id, status, ward"),
      supabase.from("adime_notes").select("id, patient_name, created_at, created_by, assessment").order("created_at", { ascending: false }).limit(10),
    ]).then(([pRes, nRes]) => {
      if (pRes.data) {
        const all = pRes.data;
        setTotal(all.length);
        setActive(all.filter((p) => p.status === "Active").length);
        setDischarged(all.filter((p) => p.status === "Discharged").length);
        const wardMap: Record<string, number> = {};
        all.forEach((p) => {
          const w = p.ward || "Unassigned";
          wardMap[w] = (wardMap[w] || 0) + 1;
        });
        setWards(Object.entries(wardMap).map(([ward, count]) => ({ ward, count })).sort((a, b) => b.count - a.count));
      }
      if (nRes.data) setNotes(nRes.data);
      setLoading(false);
    });
  }, []);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  if (loading) return <div className="p-6 text-slate-400 text-sm">Loading reports...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Summary of nutrition care activity</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{total}</p>
          <p className="text-xs text-slate-400 mt-1">Total</p>
        </div>
        <div className="bg-emerald-600 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{active}</p>
          <p className="text-xs text-emerald-200 mt-1">Active</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-3xl font-bold text-slate-800">{discharged}</p>
          <p className="text-xs text-slate-400 mt-1">Discharged</p>
        </div>
      </div>

      {/* Ward breakdown */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Patients by Ward</h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {wards.length === 0 ? (
            <p className="text-slate-400 text-sm px-4 py-4">No data.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {wards.map((w) => (
                <div key={w.ward} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-700">{w.ward}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${Math.round((w.count / total) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-6 text-right">{w.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent ADIME notes */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Recent ADIME Notes</h2>
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-slate-400 text-sm">No notes yet.</p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-semibold text-slate-800">{n.patient_name}</p>
                  <span className="text-xs text-slate-400">{fmt(n.created_at)}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{n.assessment}</p>
                <p className="text-xs text-slate-400 mt-1">By {n.created_by}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
