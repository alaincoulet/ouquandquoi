// ==========================================================
// FICHIER : src/components/activities/ActivityForm.tsx
// Formulaire de dépôt/modification d'activité (oùquandquoi.fr)
// - Compatible avec refonte "pages légales" (Layout)
// ==========================================================

import React, { useState, DragEvent, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FilterButton from '@/components/atoms/FilterButton';
import { MapPinIcon, CalendarIcon, KeyIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { ActivityWherePanel } from "./ActivityWherePanel";
import { FilterWhenPanel } from '@/components/molecules/filters/FilterWhenPanel';
import { FilterWhatPanel } from '@/components/molecules/filters/FilterWhatPanel';
import { CATEGORIES } from '@/utils/categories';
import ImageCropperA4 from './ImageCropperA4';

// --- Mock utilisateur connecté (à remplacer par AuthContext)
const mockUser = {
  name: "Alain",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
};

export default function ActivityForm() {
  // === ÉTAT (useState, useEffect, etc.) ===
  const locationRoute = useLocation();
  const searchParams = new URLSearchParams(locationRoute.search);
  const editId = searchParams.get('edit');
  const [dragActive, setDragActive] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [contactAllowed, setContactAllowed] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [location, setLocation] = useState("");
  const [locationLat, setLocationLat] = useState<number | undefined>();
  const [locationLon, setLocationLon] = useState<number | undefined>();
  const [when, setWhen] = useState('Quand ?');
  const [showWherePanel, setShowWherePanel] = useState(false);
  const [showWhenPanel, setShowWhenPanel] = useState(false);
  const [showWhatPanel, setShowWhatPanel] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // === COMPORTEMENTS (handlers, logique, effets) ===
  useEffect(() => {
    if (!editId) return;
    fetch(`http://localhost:4000/api/activities/${editId}`)
      .then(res => { if (!res.ok) throw new Error("Erreur API"); return res.json(); })
      .then(activity => {
        setTitle(activity.title || "");
        setCategory(activity.category || "");
        setSubcategory(activity.subcategory || "");
        setDescription(activity.description || "");
        setWebsite(activity.website || "");
        setContactAllowed(activity.contactAllowed || false);
        setContactEmail(activity.contactEmail || "");
        setLocation(activity.location || "");
        setLocationLat(activity.lat);
        setLocationLon(activity.lon);
        setWhen(activity.when || "Quand ?");
        if (activity.image) {
          setDroppedFile({ name: "image_existante.jpg" } as File);
          setCroppedImage(null);
          setImageSrc(activity.image);
        }
      })
      .catch(() => setError("Impossible de charger l’activité à modifier !"));
  }, [editId]);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDragActive(true);
  }
  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDragActive(false);
  }
  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDroppedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImageSrc(ev.target?.result as string);
      reader.readAsDataURL(file);
      setCroppedImage(null);
    }
  }
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setDroppedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImageSrc(ev.target?.result as string);
      reader.readAsDataURL(file);
      setCroppedImage(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!title.trim()) { setError("Le titre est obligatoire !"); return; }
    if (!category) { setError("La catégorie est obligatoire !"); return; }
    if (!subcategory) { setError("La sous-catégorie est obligatoire !"); return; }
    if (!location.trim()) { setError("La localisation est obligatoire !"); return; }
    if (!when || when === "Quand ?" || !when.trim()) { setError("La date/période est obligatoire !"); return; }
    if (contactAllowed && !contactEmail.trim()) { setError("Merci de saisir une adresse e-mail pour être contacté."); return; }

    const activity = {
      title, description, location, when,
      user: mockUser.name, // À remplacer par _id ou context réel
      category, subcategory, website,
      contactAllowed, contactEmail: contactAllowed ? contactEmail : "",
      lat: locationLat, lon: locationLon,
    };
    const formData = new FormData();
    formData.append("data", JSON.stringify(activity));
    if (croppedImage) {
      const byteString = atob(croppedImage.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: 'image/jpeg' });
      formData.append("image", blob, "cropped.jpg");
    } else if (droppedFile) {
      formData.append("image", droppedFile);
    }
    const url = editId
      ? `http://localhost:4000/api/activities/${editId}`
      : "http://localhost:4000/api/activities";
    const method = editId ? "PATCH" : "POST";
    try {
      const response = await fetch(url, { method, body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData && errorData.message ? errorData.message : "Erreur lors de l'envoi de l'activité";
        setError(msg); alert(msg); return;
      }
      alert(editId ? "Activité modifiée !" : "Activité enregistrée !");
      navigate("/");
    } catch (err: any) {
      setError("Erreur réseau lors de l'envoi de l'activité"); alert("Erreur réseau lors de l'envoi de l'activité !");
    }
  }

  // === AFFICHAGE (render JSX) ===
  return (
    <div>
      {/* --- Bloc principal CENTRÉ (boutons colonne + image) --- */}
      <div className="w-full flex justify-center">
        <div className="flex flex-row items-start justify-center gap-12 mt-10 mb-10 max-w-4xl w-full">
          {/* Colonne de boutons */}
          <div className="flex flex-col gap-4 items-center pt-8 min-w-[120px]">
            <div className="relative">
              <FilterButton
                label={location ? location : "Où ?"}
                icon={<MapPinIcon className="w-5 h-5" />}
                isActive={showWherePanel}
                onClick={() => setShowWherePanel((v) => !v)}
              />
              {showWherePanel && (
                <div className="absolute left-full top-0 z-30">
                  <ActivityWherePanel
                    value={location}
                    onChange={(val) => {
                      setLocation(val.label);
                      setLocationLat(val.lat);
                      setLocationLon(val.lon);
                    }}
                    onClose={() => setShowWherePanel(false)}
                  />
                </div>
              )}
            </div>
            <div className="relative">
              <FilterButton
                label={when}
                icon={<CalendarIcon className="w-5 h-5" />}
                isActive={showWhenPanel}
                onClick={() => setShowWhenPanel((v) => !v)}
              />
              {showWhenPanel && (
                <div className="absolute left-full top-0 z-30">
                  <FilterWhenPanel
                    value={when}
                    onChange={(val) => setWhen(val)}
                    onClose={() => setShowWhenPanel(false)}
                  />
                </div>
              )}
            </div>
            <div className="relative">
              <FilterButton
                label={title ? title : "Quoi ?"}
                icon={<KeyIcon className="w-5 h-5" />}
                isActive={showWhatPanel}
                onClick={() => setShowWhatPanel((v) => !v)}
              />
              {showWhatPanel && (
                <div className="absolute left-full top-0 z-30">
                  <FilterWhatPanel
                    value={{ keyword: title }}
                    onChange={(val) => setTitle(val.keyword)}
                    onClose={() => setShowWhatPanel(false)}
                  />
                </div>
              )}
            </div>
          </div>
          {/* Zone image */}
          <div className="flex flex-col items-center flex-1 md:items-start">
            <div
              className={`w-[200px] h-[280px] lg:w-[340px] lg:h-[480px] flex items-center justify-center rounded-lg border-2 border-dashed border-[#B9B6B3] bg-white relative ${dragActive ? "border-green-400 bg-green-50" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {croppedImage ? (
                <img src={croppedImage} alt="Aperçu recadré" className="object-cover w-full h-full rounded" />
              ) : imageSrc ? (
                <img src={imageSrc} alt="Aperçu à recadrer" className="object-cover w-full h-full rounded" />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#B9B6B3]">
                  <PhotoIcon className="w-12 h-12 mb-2" />
                  <span className="text-xs">Aucune image<br />Glissez-déposez<br />ou</span>
                  <label className="text-blue-700 underline cursor-pointer mt-1">
                    Parcourir
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
              {droppedFile && imageSrc && !croppedImage && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-white text-xs px-2 py-1 rounded shadow">Recadrez l'image</span>
                </div>
              )}
            </div>
            {imageSrc && !croppedImage && (
              <div className="w-full my-2">
                <ImageCropperA4
                  imageSrc={imageSrc}
                  onCropComplete={(croppedImg) => setCroppedImage(croppedImg)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire principal */}
      <form
        className="w-full max-w-6xl mx-auto flex flex-col gap-4 bg-[#FDF7F1] px-2 md:px-8"
        onSubmit={handleSubmit}
      >
        {/* ... tout le reste du formulaire inchangé ... */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="titre-activite">Titre de l’activité :</label>
          <input
            id="titre-activite"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l’activité"
            className="w-full bg-white border border-[#B9B6B3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Catégorie :</label>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setSubcategory(""); }}
              className="w-full bg-white border border-[#B9B6B3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Sous-catégorie :</label>
            <select
              value={subcategory}
              onChange={e => setSubcategory(e.target.value)}
              className="w-full bg-white border border-[#B9B6B3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
              required
              disabled={!category}
            >
              <option value="">Sélectionnez une sous-catégorie</option>
              {category && CATEGORIES.find(cat => cat.name === category)?.sub.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className="relative mb-2">
            <label className="block font-semibold mb-1" htmlFor="description-activite">
              Description de votre activité
            </label>
            <span className="absolute top-0 right-0 flex items-center group cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-green-700 border border-green-700 rounded-full bg-white p-1 transition group-hover:bg-green-700 group-hover:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                tabIndex={0}
                aria-label="Aide pour remplir la description"
              >
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="17" textAnchor="middle" fontSize="14" fill="currentColor">i</text>
              </svg>
              <span className="absolute z-10 top-8 right-0 w-[340px] text-xs bg-white text-gray-800 rounded shadow-lg border border-green-700 px-4 py-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                <b>Pensez à préciser :</b><br />
                - Tarif : entrée, réductions, gratuité<br />
                - Modalités d’inscription : lien, procédure, doc nécessaires<br />
                - Public visé : tous, licenciés, adhérents...<br />
                - Accessibilité, PMR<br />
                - Stationnement (véhicules, vélo, navette)<br />
                - Restauration, sanitaires<br />
                - Solution de repli intempéries<br />
                - Dress code ou équipement<br />
                - Animaux autorisés ou non
              </span>
            </span>
          </div>
          <textarea
            id="description-activite"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre activité"
            className="w-full bg-white border border-[#B9B6B3] rounded px-3 py-2 min-h-[10rem] resize-none focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            rows={10}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Site web (optionnel)&nbsp;:</label>
          <input
            type="url"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            placeholder="https://www.monsite.fr"
            className="w-full bg-white border border-[#B9B6B3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="contactAllowed"
            checked={contactAllowed}
            onChange={e => {
              setContactAllowed(e.target.checked);
              if (!e.target.checked) setContactEmail("");
            }}
            className="mr-2"
          />
          <label htmlFor="contactAllowed" className="select-none">
            J’accepte d’être contacté par les visiteurs du site oùquandquoi.fr
          </label>
        </div>
        {contactAllowed && (
          <div>
            <label className="block font-semibold mb-1" htmlFor="contact-email">E-mail pour être contacté :</label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder="adresse@email.fr"
              className="w-full bg-white border border-[#B9B6B3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
              autoFocus
            />
          </div>
        )}
                {error && (
          <div className="text-red-600 text-xs mt-1">{error}</div>
        )}
        <div className="flex items-center bg-white border-t border-[#E3DFDC] px-0 py-3 gap-3 mt-6 rounded">
          <img src={mockUser.avatar} alt={mockUser.name} className="w-9 h-9 rounded-full border" />
          <div>
            <div className="font-semibold text-[15px] text-[#3C3834]">{mockUser.name}</div>
            <div className="text-xs text-[#B9B6B3]">Mes activités, profil</div>
          </div>
          <div className="ml-auto text-xl text-[#B9B6B3]">&gt;</div>
        </div>
        <div className="flex justify-center py-5">
          <button
            type="submit"
            className="w-1/3 py-3 rounded-lg bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition"
          >
            {editId ? "Enregistrer les modifications" : "Publier l’activité"}
          </button>
        </div>
        <div className="text-xs text-[#B9B6B3] text-center py-2">oùquandquoi, 2025</div>
      </form>
    </div>
  );
}
