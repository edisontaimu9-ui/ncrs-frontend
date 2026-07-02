import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Patient {
  id: string;
  full_name: string;
  date_of_birth: string;
  sex: string;
  ward: string;
  facility: string;
  contact_number: string;
  admission_date: string;
  nutrition_diagnosis: string;
  status: string;
  created_at: string;
}

function calcAge(dob: string) {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + " yrs";
}

function fmt(date: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (!error) setPatient(data);
        setLoading(false);
      });
  }, [id]);

  const handleDischarge = async () => {
    await supabase.from("patients").update({ status: "Discharged" }).eq("id", id);
    setPatient((p) => p ? { ...p, status: "Discharged" } : p);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await supabase.from("patients").delete().eq("id", id);
    navigate("/patients");
  };

  if (loading) return <div className="p-6 text-slate-400 text-sm">Loading...</div>;
  if (!patient) return <div className="p-6 text-slate-400 text-sm">Patient not found.</div>;

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/patients")} className="text-slate-400 hover:text-slate-600 text-lg">←</button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">{patient.full_name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              patient.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}>
              {patient.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Registered {fmt(patient.created_at)}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Personal Info */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Personal Information</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <Row label="Full name" value={patient.full_name} />
            <Row label="Date of birth" value={fmt(patient.date_of_birth)} />
            <Row label="Age" value={calcAge(patient.date_of_birth)} />
            <Row label="Sex" value={patient.sex} />
            <Row label="Contact" value={patient.contact_number} />
          </div>
        </section>

        {/* Admission */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Admission Details</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <Row label="Facility" value={patient.facility} />
            <Row label="Ward" value={patient.ward} />
            <Row label="Admission date" value={fmt(patient.admission_date)} />
            <Row label="Status" value={patient.status} />
          </div>
        </section>

        {/* Nutrition */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nutrition Information</h2>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-slate-700 leading-relaxed">
              {patient.nutrition_diagnosis || <span className="text-slate-400">No diagnosis recorded.</span>}
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <button
            onClick={() => navigate(`/adime?patient_id=${id}&name=${encodeURIComponent(patient.full_name)}`)}
            className="w-full bg-[#0F4C3A] hover:bg-[#0a3629] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            + New ADIME Note
          </button>

          {patient.status === "Active" && (
            <button
              onClick={handleDischarge}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Mark as Discharged
            </button>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-500 font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Delete Patient
          </button>
        </section>
      </div>

      {/* Delete confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-slate-800 mb-2">Delete patient?</h3>
            <p className="text-slate-500 text-sm mb-6">This will permanently remove {patient.full_name} and all their records.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between px-4 py-3">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-sm text-slate-700 text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}
