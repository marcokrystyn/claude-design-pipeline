'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';

/**
 * Chata POV Walkthrough — photo-sequence walkthrough.
 *
 * Five stills of one cabin play as a single continuous visit: arrival, through the
 * interior, out to the evening exterior. Desktop pins the sequence to scroll;
 * mobile auto-advances. Nothing but transform and opacity is animated.
 *
 * Built from prompts/approved/2026-08-12-2138-chata-pov-walkthrough.md
 */

/** How the Ken-Burns drift reads on a given frame. */
export type Drift = 'out' | 'in' | 'hold';

export interface WalkthroughPhoto {
  /** Full-size source. */
  src: string;
  /** Responsive candidates, e.g. "cabin-800.jpg 800w, cabin-1600.jpg 1600w". */
  srcSet?: string;
  /** Defaults to "100vw" — the frame is always full-bleed. */
  sizes?: string;
  /** Describes the room, not the file. Read out by screen readers. */
  alt: string;
  /** Room name shown bottom-left, in Czech. */
  caption: string;
  /**
   * Drift for this frame. Defaults by position: the arrival shot drifts out, the
   * interiors drift in, the closing evening shot holds still.
   */
  drift?: Drift;
}

export interface ChataPovWalkthroughProps {
  photos: WalkthroughPhoto[];
  /** Accessible name for the section. */
  label?: string;
  className?: string;
}

/** Dwell per photo before the sequence auto-advances. */
const DWELL_MS = 6000;
/** Standard cross-fade between two frames. */
const FADE_MS = 900;
/** The bathroom → evening cut also crosses a full day-to-night jump, so it runs longer. */
const FINALE_FADE_MS = 1600;

/** Ken-Burns travel, as a share of the frame. Overscan below must exceed this. */
const PAN = 1.5;
/** Constant bleed around each image so a panned frame never reveals an edge. */
const OVERSCAN = 3;
const KEN_BURNS_SCALE = 1.06;

const DEFAULT_DRIFTS: Drift[] = ['out', 'in', 'in', 'in', 'hold'];

function driftFor(photo: WalkthroughPhoto, index: number, count: number): Drift {
  if (photo.drift) return photo.drift;
  if (index === count - 1) return 'hold';
  return DEFAULT_DRIFTS[index] ?? 'in';
}

/** Milliseconds of the cross-fade that carries frame `index` out to `index + 1`. */
function fadeOutOf(index: number, count: number): number {
  return index === count - 2 ? FINALE_FADE_MS : FADE_MS;
}

function panRange(drift: Drift): [string, string] {
  if (drift === 'hold') return ['0%', '0%'];
  return drift === 'out' ? ['0%', `${-PAN}%`] : [`${PAN}%`, '0%'];
}

/**
 * How far the pinned section has been scrolled through, 0 to 1 — the section's
 * top meeting the viewport top through to its bottom meeting the viewport bottom.
 *
 * Measured explicitly rather than with framer's `useScroll({ target })`, which
 * resolved to a constant 1 here: the value never changed, so nothing downstream
 * of it ever updated.
 */
function useSectionProgress(ref: RefObject<HTMLElement>, enabled: boolean): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const rect = element.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      progress.set(travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel)));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled, ref, progress]);

  return progress;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, [query]);

  return matches;
}

/* ------------------------------------------------------------------ *
 * Frame
 * ------------------------------------------------------------------ */

interface FrameProps {
  photo: WalkthroughPhoto;
  index: number;
  priority: boolean;
}

/** The image itself, with its shared contrast curve and constant overscan. */
function FrameImage({ photo, priority }: { photo: WalkthroughPhoto; priority: boolean }) {
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={photo.sizes ?? '100vw'}
      alt={photo.alt}
      draggable={false}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      // Spelt lowercase on purpose: React 18 drops the camelCase `fetchPriority`
      // with a warning, while the lowercase DOM attribute reaches the browser
      // under both React 18 and 19.
      {...(priority ? ({ fetchpriority: 'high' } as Record<string, string>) : {})}
      className="absolute h-full w-full object-cover"
      style={{
        // One curve, applied identically to all five, so they read as one location.
        filter: 'contrast(1.04) saturate(1.02)',
        width: `${100 + OVERSCAN * 2}%`,
        height: `${100 + OVERSCAN * 2}%`,
        left: `${-OVERSCAN}%`,
        top: `${-OVERSCAN}%`,
      }}
    />
  );
}

/** Scroll-driven frame: opacity, scale and pan are all read off scroll position. */
function ScrollFrame({
  photo,
  index,
  count,
  progress,
  priority,
}: FrameProps & { count: number; progress: MotionValue<number> }) {
  const segment = 1 / count;
  const start = index * segment;
  const end = (index + 1) * segment;

  // A cross-fade's wall-clock duration has no meaning under scroll control, so the
  // ms values are carried over as their share of a dwell — preserving the ratio
  // that makes the closing transition read as slower than the rest.
  const fadeOut = (fadeOutOf(index, count) / DWELL_MS) * segment;
  const fadeIn = (fadeOutOf(index - 1, count) / DWELL_MS) * segment;

  const stops: number[] = [];
  const values: number[] = [];

  if (index === 0) {
    stops.push(0);
    values.push(1);
  } else {
    stops.push(start - fadeIn / 2, start + fadeIn / 2);
    values.push(0, 1);
  }

  if (index === count - 1) {
    stops.push(1);
    values.push(1);
  } else {
    stops.push(end - fadeOut / 2, end + fadeOut / 2);
    values.push(1, 0);
  }

  const drift = driftFor(photo, index, count);
  const [panFrom, panTo] = panRange(drift);

  const opacity = useTransform(progress, stops, values);
  const scale = useTransform(
    progress,
    [start, end],
    drift === 'hold' ? [1, 1] : [1, KEN_BURNS_SCALE]
  );
  const x = useTransform(progress, [start, end], [panFrom, panTo]);

  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      <motion.div className="absolute inset-0" style={{ scale, x }}>
        <FrameImage photo={photo} priority={priority} />
      </motion.div>
    </motion.div>
  );
}

/** Timer-driven frame, used on small screens and whenever motion is reduced. */
function AutoFrame({
  photo,
  index,
  count,
  active,
  reduced,
  paused,
  priority,
}: FrameProps & { count: number; active: boolean; reduced: boolean; paused: boolean }) {
  const drift = driftFor(photo, index, count);
  const [panFrom, panTo] = panRange(drift);
  const still = reduced || drift === 'hold';

  // Frame `index` fades in using the cross-fade that carried its predecessor out.
  const fadeMs = fadeOutOf(index - 1, count);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: fadeMs / 1000, ease: 'easeInOut' }}
      aria-hidden={!active}
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={
          still
            ? { scale: 1, x: '0%' }
            : { scale: active ? KEN_BURNS_SCALE : 1, x: active ? panTo : panFrom }
        }
        transition={
          still || !active || paused
            ? { duration: 0 }
            : { duration: DWELL_MS / 1000, ease: 'linear' }
        }
      >
        <FrameImage photo={photo} priority={priority} />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Overlay
 * ------------------------------------------------------------------ */

interface OverlayProps {
  caption: string;
  position: string;
  showBar: boolean;
  barKey: number;
  running: boolean;
}

/**
 * Caption, scrim and progress bar. The scrim covers only the lower band, so the
 * photographs are never darkened as a whole.
 */
function Overlay({ caption, position, showBar, barKey, running }: OverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0">
      <div className="h-40 bg-gradient-to-t from-black/60 via-black/25 to-transparent sm:h-48" />

      <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-8 sm:pb-8 lg:px-12 lg:pb-10">
        <div aria-live="polite" aria-atomic="true">
          <span className="sr-only">{position}</span>
          <motion.span
            key={caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: FADE_MS / 1000, ease: 'easeInOut' }}
            className="block font-serif text-xs uppercase tracking-[0.22em] text-[#C6A15B] sm:text-sm"
          >
            {caption}
          </motion.span>
        </div>

        {showBar ? (
          <div className="mt-4 h-px w-full overflow-hidden bg-[#F5F0E8]/25">
            <motion.div
              key={barKey}
              className="h-full w-full origin-left bg-[#C6A15B]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: running ? 1 : 0 }}
              transition={{ duration: running ? DWELL_MS / 1000 : 0, ease: 'linear' }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function ChataPovWalkthrough({
  photos,
  label = 'Prohlídka chaty',
  className = '',
}: ChataPovWalkthroughProps) {
  const count = photos.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => setMounted(true), []);

  // Reduced motion drops the pin along with the Ken-Burns, so the sequence keeps
  // advancing but never moves the frame under the reader.
  const scrollDriven = mounted && isDesktop && !reduced;

  const scrollYProgress = useSectionProgress(containerRef, scrollDriven);

  const atEnd = index >= count - 1;
  const running = mounted && !scrollDriven && !paused && !atEnd;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setIndex((i) => Math.min(i + 1, count - 1)), DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, count]);

  useEffect(() => {
    if (!scrollDriven) return;
    return scrollYProgress.on('change', (value) => {
      const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
      setIndex((current) => (current === next ? current : next));
    });
  }, [scrollDriven, scrollYProgress, count]);

  const togglePaused = useCallback(() => {
    if (scrollDriven) return;
    setPaused((value) => !value);
  }, [scrollDriven]);

  if (!count) return null;

  const active = photos[Math.min(index, count - 1)];
  const position = `${index + 1} z ${count}`;

  // Before hydration — and with scripting unavailable — the frames render as a
  // plain captioned stack that scrolls normally.
  const body = !mounted ? (
    photos.map((photo, i) => (
      <figure key={photo.src} className="relative m-0 h-screen w-full overflow-hidden">
        <FrameImage photo={photo} priority={i === 0} />
        <figcaption className="absolute inset-x-0 bottom-0">
          <div className="h-40 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
          <span className="absolute bottom-6 left-5 font-serif text-xs uppercase tracking-[0.22em] text-[#C6A15B] sm:left-8">
            {photo.caption}
          </span>
        </figcaption>
      </figure>
    ))
  ) : scrollDriven ? (
    <div className="sticky top-0 h-screen w-full overflow-hidden">
      {photos.map((photo, i) => (
        <ScrollFrame
          key={photo.src}
          photo={photo}
          index={i}
          count={count}
          progress={scrollYProgress}
          priority={i === 0}
        />
      ))}
      <Overlay
        caption={active.caption}
        position={position}
        showBar={false}
        barKey={index}
        running={false}
      />
    </div>
  ) : (
    <>
      {photos.map((photo, i) => (
        <AutoFrame
          key={photo.src}
          photo={photo}
          index={i}
          count={count}
          active={i === index}
          reduced={reduced}
          paused={paused}
          priority={i === 0}
        />
      ))}

      <Overlay
        caption={active.caption}
        position={position}
        showBar={!atEnd}
        barKey={index}
        running={running}
      />

      {/* Keyboard equivalent of tap-to-pause. Stays out of the layout until focused,
          so the sequence gains no visible chrome. */}
      <button
        type="button"
        onClick={togglePaused}
        className="sr-only focus:not-sr-only focus:absolute focus:right-5 focus:top-5 focus:z-10 focus:rounded-none focus:border focus:border-[#C6A15B] focus:bg-black/70 focus:px-4 focus:py-2 focus:font-serif focus:text-xs focus:uppercase focus:tracking-[0.22em] focus:text-[#F5F0E8]"
      >
        {paused ? 'Pokračovat v prohlídce' : 'Pozastavit prohlídku'}
      </button>
    </>
  );

  // One section carries the ref in every mode. Attaching it only in the pinned
  // branch left useScroll measuring a ref that was still null on first render,
  // so scroll progress never moved off zero and the sequence never advanced.
  return (
    <section
      ref={containerRef}
      aria-label={label}
      className={`relative bg-[#0E0C0A] ${
        mounted && !scrollDriven ? 'h-screen w-full overflow-hidden' : ''
      } ${className}`}
      style={scrollDriven ? { height: `${count * 100}vh` } : undefined}
      onClick={mounted && !scrollDriven ? togglePaused : undefined}
    >
      {body}
    </section>
  );
}
