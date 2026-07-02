import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Patient {
  id: string;
  full_name: string;
  date_of_birth: string;
  sex: string;
  ward: string;
  admission_date: string;
  nutrition_diagnosis: string;
  status: "Active" | "Discharged";
}

function calcAge(dob: string) {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("patients")
      .select("*")
      .order("admission_date", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setPatients(data);
          setFiltered(data);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = patients;
    if (statusFilter !== "All") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.ward?.toLowerCase().includes(q) ||
          p.nutrition_diagnosis?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, patients]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Patient Registry</h1>
          <p className="text-slate-500 text-sm mt-0.5">{patients.length} patients registered</p>
        </div>
        <button
          onClick={() => navigate("/new-patient")}
          className="bg-[#0F4C3A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#0a3629] transition-colors"
        >
          + New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, ward, diagnosis..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option>All</option>
          <option>Active</option>
          <option>Discharged</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading patients...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-sm">No patients found.</p>
          <button
            onClick={() => navigate("/new-patient")}
            className="mt-4 text-emerald-700 text-sm font-semibold hover:underline"
          >
            Register your first patient →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Age</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sex</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ward</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Admitted</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Diagnosis</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{p.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">{calcAge(p.date_of_birth)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.sex}</td>
                    <td className="px-4 py-3 text-slate-600">{p.ward || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.admission_date ? new Date(p.admission_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{p.nutrition_diagnosis || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
