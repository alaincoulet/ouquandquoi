// ==========================================================
// FICHIER : src/components/ui/Carousel.tsx
// Composant Carousel universel basé sur Embla
// - Drag souris ET tactile fluide, snapping natif
// - Flèches navigation custom optionnelles
// - Affiche tout children (ProductCard, ActivityCard…)
// - Fallback UX intégré si aucun élément
// - 100% compatible Tailwind v3, responsive
// ==========================================================

import React, { PropsWithChildren, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

type CarouselProps = {
  withArrows?: boolean;
  className?: string;
  fallbackText?: string; // message affiché si aucune card
};

const CARD_WIDTH = 288; // largeur par défaut ProductCard
const CARD_GAP = 32;    // 1/10 de CARD_WIDTH

const Carousel: React.FC<PropsWithChildren<CarouselProps>> = ({
  children,
  withArrows = true,
  className = "",
  fallbackText = "Aucune activité trouvée",
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    skipSnaps: false,
    dragFree: false,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      '(max-width: 768px)': { slidesToScroll: 1 },
    },
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateNav = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateNav);
    updateNav();
    return () => {
      emblaApi.off("select", updateNav);
    };
  }, [emblaApi, updateNav]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const safeChildren = React.Children.toArray(children);

  // Fallback UX si aucune carte à afficher
  if (!safeChildren.length) {
    return (
      <div className={`w-full text-center py-12 text-gray-600 text-lg ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div ref={emblaRef} className="overflow-hidden">
        <div
          className="flex"
          style={{ gap: `${CARD_GAP}px` }} // ← gap dynamique selon largeur card
        >
          {safeChildren.map((child, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 select-none"
              style={{
                width: `${CARD_WIDTH}px`,
                maxWidth: `${CARD_WIDTH}px`,
                margin: 0,
                padding: 0,
              }}
              onDragStart={e => e.preventDefault()}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Flèches navigation custom */}
      {withArrows && safeChildren.length > 1 && (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-2 -translate-y-1/2 z-10 bg-white/80 rounded-full shadow p-1 hover:bg-blue-100 transition disabled:opacity-30"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Précédent"
          >
            <ChevronLeftIcon className="w-6 h-6 text-blue-600" />
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-2 -translate-y-1/2 z-10 bg-white/80 rounded-full shadow p-1 hover:bg-blue-100 transition disabled:opacity-30"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Suivant"
          >
            <ChevronRightIcon className="w-6 h-6 text-blue-600" />
          </button>
        </>
      )}
    </div>
  );
};

export default Carousel;
