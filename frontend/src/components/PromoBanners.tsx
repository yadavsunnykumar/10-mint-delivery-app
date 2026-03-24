import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import banner3 from "@/assets/banner3.png";
import banner4 from "@/assets/banner4.png";

const BANNERS_LEFT = [
  { src: banner1, alt: "Everest Dash – Fresh groceries delivered" },
  { src: banner2, alt: "10-minute delivery to your door" },
];

const BANNERS_RIGHT = [
  { src: banner3, alt: "Zero delivery fees on first order" },
  { src: banner4, alt: "Exclusive deals on daily essentials" },
];

const AUTO_SCROLL_MS = 3500;

// Offset the second slider so they don't show the same image at the same time

function BannerSlider({
  banners,
  syncIndex,
  onIndexChange,
}: {
  banners: { src: string; alt: string }[];
  syncIndex: number;
  onIndexChange: (i: number) => void;
}) {
  const current = syncIndex % banners.length;
  const goTo = (idx: number) =>
    onIndexChange((idx + banners.length) % banners.length);

  return (
    <div className="relative rounded-2xl overflow-hidden select-none group flex-1 min-w-0">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, i) => (
          <div key={i} className="min-w-full">
            <img
              src={b.src}
              alt={b.alt}
              className="w-full h-32 sm:h-44 md:h-52 object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Prev arrow */}
      <button
        onClick={() => goTo(current - 1)}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Next arrow */}
      <button
        onClick={() => goTo(current + 1)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        aria-label="Next banner"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-4 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

const PromoBanners = () => {
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const leftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    leftTimer.current = setTimeout(
      () => setLeftIndex((p) => (p + 1) % BANNERS_LEFT.length),
      AUTO_SCROLL_MS,
    );
    return () => {
      if (leftTimer.current) clearTimeout(leftTimer.current);
    };
  }, [leftIndex]);

  useEffect(() => {
    rightTimer.current = setTimeout(
      () => setRightIndex((p) => (p + 1) % BANNERS_RIGHT.length),
      AUTO_SCROLL_MS,
    );
    return () => {
      if (rightTimer.current) clearTimeout(rightTimer.current);
    };
  }, [rightIndex]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex gap-3">
        <BannerSlider
          banners={BANNERS_LEFT}
          syncIndex={leftIndex}
          onIndexChange={setLeftIndex}
        />
        <BannerSlider
          banners={BANNERS_RIGHT}
          syncIndex={rightIndex}
          onIndexChange={setRightIndex}
        />
      </div>
    </div>
  );
};

export default PromoBanners;
