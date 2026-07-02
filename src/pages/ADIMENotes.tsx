import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface ADIMENote {
  id: string;
  patient_id: string;
  patient_name: string;
  assessment: string;
  diagnosis: string;
  intervention: string;
  monitoring: string;
  created_at: string;
  created_by: string;
}

interface NoteForm {
  assessment: string;
  diagnosis: string;
  intervention: string;
  monitoring: string;
}

const EMPTY: NoteForm = { assessment: "", diagnosis: "", intervention: "", monitoring: "" };

const SECTIONS = [
  { key: "assessment", label: "A — Assessment", placeholder: "Nutrition assessment findings: anthropometrics, biochemical, clinical, dietary (ABCD)..." },
  { key: "diagnosis", label: "D — Diagnosis (PES)", placeholder: "Problem related to Etiology as evidenced by Signs/Symptoms..." },
  { key: "intervention", label: "I — Intervention", placeholder: "Nutrition prescription, counseling, coordination of care..." },
  { key: "monitoring", label: "M&E — Monitoring & Evaluation", placeholder: "Goals, indicators to monitor, expected outcomes..." },
];

export default function ADIMENotes() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patient_id");
  const patientName = searchParams.get("name") || "Patient";
  const navigate = useNavigate();

  const [notes, setNotes] = useState<ADIMENote[]>([]);
  const [form, setForm] = useState<NoteForm>(EMPTY);
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [selected, setSelected] = useState<ADIMENote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    supabase
      .from("adime_notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setNotes(data);
        setLoading(false);
      });
  }, [patientId]);

  const update = (field: keyof NoteForm) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.assessment.trim()) { setError("Assessment is required."); return; }
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("adime_notes")
      .insert([{
        patient_id: patientId,
        patient_name: patientName,
        ...form,
        created_by: user?.user_metadata?.full_name || user?.email || "Unknown",
      }])
      .select()
      .single();

    if (error) { setError(error.message); setSaving(false); return; }
    setNotes((n) => [data, ...n]);
    setForm(EMPTY);
    setView("list");
    setSaving(false);
  };

  const fmt = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (!patientId) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-slate-400 text-sm">Open a patient profile and click <strong>+ New ADIME Note</strong>.</p>
        <button onClick={() => navigate("/patients")} className="mt-4 text-emerald-700 text-sm font-semibold hover:underline">
          Go to Patients →
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => view === "list" ? navigate(`/patients/${patientId}`) : setView("list")}
          className="text-slate-400 hover:text-slate-600 text-lg"
        >←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">ADIME Notes</h1>
          <p className="text-slate-500 text-sm">{patientName}</p>
        </div>
        {view === "list" && (
          <button
            onClick={() => { setForm(EMPTY); setError(""); setView("new"); }}
            className="bg-[#0F4C3A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#0a3629] transition-colors"
          >
            + New Note
          </button>
        )}
      </div>

      {/* List view */}
      {view === "list" && (
        <>
          {loading ? (
            <div className="text-center py-20 text-slate-400 text-sm">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-sm">No ADIME notes yet.</p>
              <button
                onClick={() => setView("new")}
                className="mt-4 text-emerald-700 text-sm font-semibold hover:underline"
              >
                Write first note →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => { setSelected(note); setView("detail"); }}
                  className="bg-white rounded-2xl border border-slate-200 px-4 py-4 cursor-pointer hover:border-emerald-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">ADIME</span>
                    <span className="text-xs text-slate-400">{fmt(note.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{note.assessment}</p>
                  {note.diagnosis && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1"><strong>PES:</strong> {note.diagnosis}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">By {note.created_by}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* New note form */}
      {view === "new" && (
        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <div key={s.key} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{s.label}</h2>
              </div>
              <div className="p-4">
                <textarea
                  value={form[s.key as keyof NoteForm]}
                  onChange={update(s.key as keyof NoteForm)}
                  placeholder={s.placeholder}
                  rows={4}
                  className="w-full text-sm text-slate-800 focus:outline-none resize-none placeholder:text-slate-300"
                />
              </div>
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#0F4C3A] hover:bg-[#0a3629] disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            {saving ? "Saving..." : "Save ADIME Note"}
          </button>
        </div>
      )}

      {/* Detail view */}
      {view === "detail" && selected && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400">{fmt(selected.created_at)} · By {selected.created_by}</span>
          </div>
          {SECTIONS.map((s) => (
            <div key={s.key} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{s.label}</h2>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selected[s.key as keyof ADIMENote] || <span className="text-slate-300">Not recorded</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
