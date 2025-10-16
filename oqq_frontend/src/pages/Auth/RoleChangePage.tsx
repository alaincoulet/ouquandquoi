import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleChangePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Changer de rôle</h1>
            <p className="text-gray-600 mt-1">Rôle actuel : <strong>{user.role}</strong></p>
          </div>
          <button
            className="text-gray-500 hover:text-red-600 text-xl"
            onClick={() => navigate("/profil")}
            aria-label="Fermer"
            title="Retour au profil"
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdvertiserSection />
          <div className="space-y-6">
            <MotivationSection roleLabel="Modérateur" />
            <MotivationSection roleLabel="Administrateur" />
          </div>
        </div>

        <div className="mt-8">
          <button className="text-blue-600 underline text-sm" onClick={() => navigate("/profil")}>Retourner à mon profil</button>
        </div>
      </div>
    </div>
  );
}

// =========================
// Annonceur (Advertiser)
// =========================
function AdvertiserSection() {
  type ApplicantType = "association" | "professionnel" | "mairie";
  const [applicantType, setApplicantType] = useState<ApplicantType>("association");

  const requiredDocs = useMemo(() => {
    if (applicantType === "association") {
      return [
        { key: "rna", label: "Extrait RNA" },
        { key: "pv_ag", label: "PV de l’AG élisant le bureau" },
        { key: "id", label: "Carte d’identité" },
      ];
    }
    if (applicantType === "professionnel") {
      return [
        { key: "kbis", label: "Extrait Kbis" },
        { key: "id", label: "Carte d’identité" },
      ];
    }
    return [
      { key: "rne_ou_arrete_ou_delib", label: "Extrait RNE ou arrêté préfectoral ou copie de la délibération" },
      { key: "id", label: "Carte d’identité" },
    ];
  }, [applicantType]);

  const [filesMap, setFilesMap] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (fieldKey: string, fileList: FileList | null) => {
    const file = fileList && fileList[0] ? fileList[0] : null;
    setFilesMap(prev => ({ ...prev, [fieldKey]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Simple validation: all required docs present
    const missing = requiredDocs.filter(d => !filesMap[d.key]);
    if (missing.length > 0) {
      setError("Merci de fournir tous les justificatifs requis.");
      return;
    }

    // Stub submit: we will integrate API later
    try {
      setSubmitting(true);
      await new Promise(r => setTimeout(r, 600));
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold">Devenir Annonceur</h2>
      <p className="text-gray-600 text-sm mt-1">Publiez vos activités et gérez vos annonces.</p>

      {/* Radios */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <RadioTile
          name="applicantType"
          checked={applicantType === "association"}
          onChange={() => setApplicantType("association")}
          label="Association"
        />
        <RadioTile
          name="applicantType"
          checked={applicantType === "professionnel"}
          onChange={() => setApplicantType("professionnel")}
          label="Professionnel"
        />
        <RadioTile
          name="applicantType"
          checked={applicantType === "mairie"}
          onChange={() => setApplicantType("mairie")}
          label="Mairie"
        />
      </div>

      {/* Uploads */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {requiredDocs.map(doc => (
          <UploadField
            key={doc.key}
            label={doc.label}
            onFile={(file) => setFilesMap(prev => ({ ...prev, [doc.key]: file }))}
            selectedFile={filesMap[doc.key] || null}
          />
        ))}

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-700 text-sm">Dossier prêt. Envoi simulé avec succès.</div>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Envoi..." : "Soumettre la candidature"}
        </button>
      </form>
    </section>
  );
}

function RadioTile({ name, checked, onChange, label }: { name: string; checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className={`border rounded-xl p-3 cursor-pointer select-none flex items-center gap-2 ${checked ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="accent-blue-600" />
      <span>{label}</span>
    </label>
  );
}

function UploadField({ label, onFile, selectedFile }: { label: string; onFile: (file: File | null) => void; selectedFile: File | null }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0] : null;
    onFile(file);
  };

  return (
    <div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-gray-600 text-sm">
          Glissez-déposez un fichier ici ou
          <button
            type="button"
            className="text-blue-600 underline ml-1"
            onClick={() => inputRef.current?.click()}
          >
            choisissez un fichier
          </button>
        </div>
        {selectedFile && (
          <div className="mt-2 text-xs text-gray-700">Fichier sélectionné : <strong>{selectedFile.name}</strong></div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={e => onFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
        />
      </div>
    </div>
  );
}

// =========================
// Motivation sections
// =========================
function MotivationSection({ roleLabel }: { roleLabel: string }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <section className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold">Devenir {roleLabel}</h2>
      <p className="text-gray-600 text-sm mt-1">Rédigez une courte lettre de motivation.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm"
          placeholder="Expliquez vos motivations, votre expérience et votre disponibilité."
        />
        <div className="flex items-center justify-between">
          {submitted && <div className="text-green-700 text-sm">Candidature enregistrée (simulation).</div>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={submitting || text.trim().length < 20}>
            {submitting ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </form>
    </section>
  );
}


