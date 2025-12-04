"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomScrollbarProps {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  totalSteps?: number;
}

export function CustomScrollbar({
  scrollContainerRef,
  totalSteps = 5,
}: CustomScrollbarProps) {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [maxScroll, setMaxScroll] = React.useState(0);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollInfo = () => {
      const newScrollPosition = container.scrollLeft;
      const newMaxScroll = container.scrollWidth - container.clientWidth;
      setScrollPosition(newScrollPosition);
      setMaxScroll(newMaxScroll);
    };

    updateScrollInfo();
    container.addEventListener("scroll", updateScrollInfo);
    window.addEventListener("resize", updateScrollInfo);

    return () => {
      container.removeEventListener("scroll", updateScrollInfo);
      window.removeEventListener("resize", updateScrollInfo);
    };
  }, [scrollContainerRef]);

  const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent =>
    "touches" in e;

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;

    const startX = isTouchEvent(e.nativeEvent)
      ? e.nativeEvent.touches[0].clientX
      : e.nativeEvent.clientX;
    const startScrollLeft = container.scrollLeft;

    const onMove = (event: MouseEvent | TouchEvent) => {
      const clientX = isTouchEvent(event)
        ? event.touches[0].clientX
        : event.clientX;
      const deltaX = clientX - startX;
      container.scrollTo({
        left:
          startScrollLeft +
          deltaX * (container.scrollWidth / container.offsetWidth),
        behavior: "auto", // change to 'smooth' if you want smooth transition (but may feel laggy)
      });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth / 2;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const progress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0;

  return (
    <div className="relative flex items-center gap-2 w-full py-4">
      <button
        onClick={() => scroll("left")}
        disabled={scrollPosition === 0}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-3 w-3 text-gray-600" />
      </button>

      <div className="relative flex-1 h-6 rounded-md border border-gray-200 bg-[#f3f3f3] overflow-hidden w-[500px]">
        {/* Progress bar */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-white border border-black rounded-md inset-0 flex justify-between px-4 cursor-grab active:cursor-grabbing touch-none"
          style={{ width: `${progress}%` }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="h-full w-[1px] bg-gray-200" />
          ))}
        </div>

        {/* Track markers */}
        {/* <div className="absolute inset-0 flex justify-between px-4">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="h-full w-[1px] bg-gray-200" />
          ))}
        </div> */}
      </div>

      <button
        onClick={() => scroll("right")}
        disabled={scrollPosition >= maxScroll}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-3 w-3 text-gray-600" />
      </button>
    </div>
  );
}
