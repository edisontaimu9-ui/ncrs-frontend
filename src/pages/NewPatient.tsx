import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const INITIAL: PatientForm = {
  full_name: "",
  date_of_birth: "",
  sex: "",
  ward: "",
  facility: "",
  contact_number: "",
  admission_date: new Date().toISOString().split("T")[0],
  nutrition_diagnosis: "",
  status: "Active",
};

const WARDS = ["General Medicine", "Paediatrics", "Surgery", "Oncology", "ICU/HDU", "Renal", "Maternity", "OPD", "Other"];
const SEX_OPTIONS = ["Male", "Female"];

export default function NewPatient() {
  const [form, setForm] = useState<PatientForm>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const update = (field: keyof PatientForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { setError("Patient name is required."); return; }
    if (!form.sex) { setError("Sex is required."); return; }
    if (!form.admission_date) { setError("Admission date is required."); return; }

    setLoading(true);
    setError("");

    const { error } = await supabase.from("patients").insert([form]);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/patients");
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/patients")}
          className="text-slate-400 hover:text-slate-600 text-lg"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">New Patient</h1>
          <p className="text-slate-500 text-sm">Register a new patient to the registry</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Personal Information</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.full_name}
                onChange={update("full_name")}
                placeholder="e.g. Chisomo Banda"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date of birth</label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={update("date_of_birth")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sex <span className="text-red-400">*</span></label>
                <select
                  value={form.sex}
                  onChange={update("sex")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select</option>
                  {SEX_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contact number</label>
              <input
                type="tel"
                value={form.contact_number}
                onChange={update("contact_number")}
                placeholder="e.g. 0991234567"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Admission Info */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Admission Details</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Facility</label>
              <input
                type="text"
                value={form.facility}
                onChange={update("facility")}
                placeholder="e.g. Queen Elizabeth Central Hospital"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ward</label>
                <select
                  value={form.ward}
                  onChange={update("ward")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select ward</option>
                  {WARDS.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Admission date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={form.admission_date}
                  onChange={update("admission_date")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={update("status")}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option>Active</option>
                <option>Discharged</option>
              </select>
            </div>
          </div>
        </section>

        {/* Nutrition */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Nutrition Information</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">Nutrition diagnosis</label>
            <textarea
              value={form.nutrition_diagnosis}
              onChange={update("nutrition_diagnosis")}
              placeholder="e.g. Inadequate protein-energy intake related to poor appetite as evidenced by 60% estimated food intake"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#0F4C3A] hover:bg-[#0a3629] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {loading ? "Registering patient..." : "Register Patient"}
        </button>
      </div>
    </div>
  );
}
