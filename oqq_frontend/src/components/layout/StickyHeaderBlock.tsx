// ==========================================================
// FICHIER : src/components/layout/StickyHeaderBlock.tsx
// Bloc sticky intelligent pour le header principal
// - Affiche le header original dans le container
// - Affiche un clone sticky dès que le scroll le justifie
// ==========================================================

import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";

// Props héritées du Header + refs de contrôle de scroll
interface StickyHeaderBlockProps {
  sentinelRef: React.RefObject<HTMLDivElement | null>; // placé tout en haut (pub)
  favoritesActive?: boolean;
  onToggleFavorites?: () => void;
  where: {
    label: string;
    location?: string;
    distance?: number;
    lat?: number;
    lon?: number;
  };
  onWhereChange: (val: any) => void;
  when: string;
  onWhenChange: (val: string) => void;
  value: {
    keyword: string;
    category?: string;
    subcategory?: string;
    excludedSubcategories?: string[];
  };
  onWhatChange: (val: {
    keyword: string;
    category?: string;
    subcategory?: string;
    excludedSubcategories?: string[];
  }) => void;
  activitiesFiltered?: any[];
  onNavigate?: (navId: string, href: string) => void;
}

const StickyHeaderBlock: React.FC<StickyHeaderBlockProps> = ({
  sentinelRef,
  ...headerProps
}) => {
  // === 1. ÉTAT ===
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  // === 2. RÉFÉRENCES ===
  const headerRef = useRef<HTMLDivElement>(null);
  const containerTopRef = useRef<HTMLDivElement>(null);

  // === 3. LOGIQUE STICKY ===
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    if (headerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) setIsStickyVisible(true);
        },
        { threshold: 1.0 }
      );
      observer.observe(headerRef.current);
      observers.push(observer);
    }
    if (containerTopRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsStickyVisible(false);
        },
        { threshold: 0 }
      );
      observer.observe(containerTopRef.current);
      observers.push(observer);
    }
    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // === 4. AFFICHAGE ===
  return (
    <>
      {/* CLONE STICKY centré, même style que container */}
      {isStickyVisible && (
  <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none" style={{ transition: "all 0.2s ease-in-out" }}>
    <div className="max-w-7xl w-full rounded-xl bg-gray-50 border border-gray-200 shadow-xl pointer-events-auto">
      <Header {...headerProps} />
    </div>
  </div>
)}
<div ref={containerTopRef} style={{ height: 1 }} />

{/* HEADER ORIGINAL (dans le flux normal, même wrapper que sticky) */}
<div ref={headerRef} className="max-w-7xl w-full rounded-xl bg-gray-50 border border-gray-200 shadow-xl mx-auto relative z-50 overflow-visible">
  <Header {...headerProps} />
</div>

    </>
  );
};

export default StickyHeaderBlock;