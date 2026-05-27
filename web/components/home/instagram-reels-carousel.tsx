"use client";

import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { ReelItem } from "@/lib/content/social-bento-content";
import { cn } from "@/lib/utils";

interface ReelSlideProps {
  reel: ReelItem;
  index: number;
  current: number;
  onSelect: (index: number) => void;
}

function ReelSlide({ reel, index, current, onSelect }: ReelSlideProps) {
  const slideRef = useRef<HTMLLIElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>();
  const [isMuted, setIsMuted] = useState(true);
  const isActive = current === index;

  // Subtle parallax: shift the inner card based on cursor distance from center.
  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      slideRef.current.style.setProperty("--x", `${xRef.current}px`);
      slideRef.current.style.setProperty("--y", `${yRef.current}px`);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Only the centered reel plays; others pause to save CPU/bandwidth.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;

    if (isActive) {
      void video.play().catch(() => {
        /* Autoplay blocked - poster stays. */
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, isMuted]);

  function handleMouseMove(event: React.MouseEvent) {
    const el = slideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + r.width / 2);
    yRef.current = event.clientY - (r.top + r.height / 2);
  }

  function handleMouseLeave() {
    xRef.current = 0;
    yRef.current = 0;
  }

  function handleCardAction() {
    if (!isActive) {
      onSelect(index);
      return;
    }

    if (reel.href) {
      window.open(reel.href, "_blank", "noopener,noreferrer");
    }
  }

  function handleSoundToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    const video = videoRef.current;
    if (!video) return;

    video.muted = nextMuted;
    if (isActive) {
      void video.play().catch(() => {
        /* Some browsers wait for the next direct user gesture. */
      });
    }
  }

  return (
    <li
      ref={slideRef}
      aria-hidden={!isActive}
      className="relative z-10 flex min-w-0 shrink-0 basis-full justify-center px-1 [perspective:1200px] [transform-style:preserve-3d]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "group relative block aspect-[9/16] w-[min(72vw,42vh,340px)] overflow-hidden rounded-3xl border border-border bg-card shadow-lifted sm:w-[min(72vw,340px)]",
          "transition-[transform,opacity] duration-500 ease-out",
        )}
        style={{
          transform: isActive ? "rotateX(0deg)" : "rotateX(8deg)",
          transformOrigin: "bottom",
          opacity: isActive ? 1 : 0.65,
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-3xl bg-[#1D1F2F] transition-transform duration-150 ease-out"
          style={{
            transform: isActive
              ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
              : "none",
          }}
        >
          <video
            ref={videoRef}
            src={reel.src}
            poster={reel.poster}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            aria-label={reel.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
          />
        </div>

        <button
          type="button"
          onClick={handleCardAction}
          aria-label={
            isActive && reel.href
              ? `Open on Instagram: ${reel.alt}`
              : `Show reel: ${reel.alt}`
          }
          aria-current={isActive ? "true" : undefined}
          tabIndex={isActive ? 0 : -1}
          className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />

        {reel.caption && (
          <p
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 pr-16 font-heading text-lg leading-tight text-white sm:text-xl",
              "transition-opacity duration-500",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            {reel.caption}
          </p>
        )}

        <button
          type="button"
          onClick={handleSoundToggle}
          aria-label={isMuted ? "Enable reel sound" : "Mute reel sound"}
          title={isMuted ? "Enable sound" : "Mute sound"}
          tabIndex={isActive ? 0 : -1}
          className={cn(
            "absolute bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lifted backdrop-blur-md",
            "transition-all duration-200 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            !isActive && "pointer-events-none opacity-0",
          )}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Volume2 className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </li>
  );
}

interface CarouselControlProps {
  direction: "previous" | "next";
  label: string;
  onClick: () => void;
}

function CarouselControl({ direction, label, onClick }: CarouselControlProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lifted",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        direction === "previous" && "rotate-180",
      )}
    >
      <ArrowRight className="h-5 w-5" />
    </button>
  );
}

interface InstagramReelsCarouselProps {
  reels: readonly ReelItem[];
}

export function InstagramReelsCarousel({ reels }: InstagramReelsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const id = useId();

  function handlePrevious() {
    setCurrent((c) => (c - 1 + reels.length) % reels.length);
  }

  function handleNext() {
    setCurrent((c) => (c + 1) % reels.length);
  }

  if (reels.length === 0) return null;

  return (
    <div
      aria-roledescription="carousel"
      aria-labelledby={`reels-carousel-${id}`}
      className="relative w-full"
    >
      <span id={`reels-carousel-${id}`} className="sr-only">
        Instagram reels carousel
      </span>

      <div className="overflow-hidden">
        <ul
          className="flex w-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translate3d(-${current * 100}%, 0, 0)`,
          }}
        >
          {reels.map((reel, index) => (
            <ReelSlide
              key={reel.id}
              reel={reel}
              index={index}
              current={current}
              onSelect={setCurrent}
            />
          ))}
        </ul>
      </div>

      {reels.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <CarouselControl
            direction="previous"
            label="Previous reel"
            onClick={handlePrevious}
          />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {current + 1} / {reels.length}
          </span>
          <CarouselControl direction="next" label="Next reel" onClick={handleNext} />
        </div>
      )}
    </div>
  );
}
