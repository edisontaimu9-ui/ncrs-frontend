import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface PatientForm {
  full_name: string;
  date_of_birth: string;
  sex: string;
  ward: string;
  facility: string;
  contact_number: string;
  admission_date: string;
  nutrition_diagnosis: string;
  status: string;
}

const WARDS = ["General Medicine", "Paediatrics", "Surgery", "Oncology", "ICU/HDU", "Renal", "Maternity", "OPD", "Other"];
const SEX_OPTIONS = ["Male", "Female"];

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<PatientForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("patients").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setForm(data);
      setLoading(false);
    });
  }, [id]);

  const update = (field: keyof PatientForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => f ? { ...f, [field]: e.target.value } : f);

  const handleSave = async () => {
    if (!form?.full_name.trim()) { setError("Patient name is required."); return; }
    setSaving(true);
    setError("");
    const { error } = await supabase.from("patients").update(form).eq("id", id);
    if (error) { setError(error.message); setSaving(false); return; }
    navigate(`/patients/${id}`);
  };

  if (loading) return <div className="p-6 text-slate-400 text-sm">Loading...</div>;
  if (!form) return <div className="p-6 text-slate-400 text-sm">Patient not found.</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/patients/${id}`)} className="text-slate-400 hover:text-slate-600 text-lg">←</button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Edit Patient</h1>
          <p className="text-slate-500 text-sm">{form.full_name}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Personal Information</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full name <span className="text-red-400">*</span></label>
              <input type="text" value={form.full_name} onChange={update("full_name")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date of birth</label>
                <input type="date" value={form.date_of_birth || ""} onChange={update("date_of_birth")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sex</label>
                <select value={form.sex || ""} onChange={update("sex")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select</option>
                  {SEX_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contact number</label>
              <input type="tel" value={form.contact_number || ""} onChange={update("contact_number")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Admission Details</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Facility</label>
              <input type="text" value={form.facility || ""} onChange={update("facility")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ward</label>
                <select value={form.ward || ""} onChange={update("ward")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select ward</option>
                  {WARDS.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Admission date</label>
                <input type="date" value={form.admission_date || ""} onChange={update("admission_date")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={form.status || "Active"} onChange={update("status")} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Active</option>
                <option>Discharged</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Nutrition Information</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">Nutrition diagnosis</label>
            <textarea value={form.nutrition_diagnosis || ""} onChange={update("nutrition_diagnosis")} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
        </section>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-red-600 text-xs">{error}</p></div>}

        <button onClick={handleSave} disabled={saving} className="w-full bg-[#0F4C3A] hover:bg-[#0a3629] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
