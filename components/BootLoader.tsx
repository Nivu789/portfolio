'use client';

import { useEffect, useRef } from 'react';

const SEGMENTS = 20;
const MIN_MS = 2600; // keep the boot screen up long enough to read
const MAX_MS = 7000; // never trap the visitor if something is slow

declare global {
  interface Window {
    __bootDone?: boolean;
  }
}

/**
 * CRT boot screen. Progress follows the real page load, then the screen
 * powers off (squash to a line, then a dot) and fires `boot:off` so the
 * 3D scene can start its render loop without competing with the animation.
 */
export default function BootLoader() {
  const bootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boot = bootRef.current;
    const bar = barRef.current;
    if (!boot || !bar) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const cells = Array.from(bar.children) as HTMLElement[];
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    let shown = 0;
    let finished = false;
    let loaded = document.readyState === 'complete';
    const start = performance.now();

    cells.forEach((c) => c.classList.remove('on'));
    boot.classList.remove('done');
    boot.hidden = false;
    window.__bootDone = false;
    document.documentElement.style.overflow = 'hidden';

    const onLoad = () => { loaded = true; };
    const reveal = () => {
      boot.hidden = true;
      document.documentElement.style.overflow = '';
    };
    const onAnimEnd = (e: AnimationEvent) => { if (e.target === boot) reveal(); };

    const setSegs = (n: number) => {
      for (let k = shown; k < n; k++) cells[k]?.classList.add('on');
      shown = n;
      bar.setAttribute('aria-valuenow', String(Math.round((n / SEGMENTS) * 100)));
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      setSegs(SEGMENTS);
      // hold the full bar for a beat, then power off on the next paint
      later(() => {
        requestAnimationFrame(() => {
          boot.classList.add('done');
          window.__bootDone = true;
          // start the 3D loop once the tube has collapsed and only the fade remains
          later(() => window.dispatchEvent(new Event('boot:off')), reduce ? 0 : 420);
        });
      }, reduce ? 0 : 160);
      boot.addEventListener('animationend', onAnimEnd);
      later(reveal, 1600); // fallback if animationend never fires
    };

    const tick = () => {
      if (finished) return;
      const elapsed = performance.now() - start;
      let target = Math.min(1, elapsed / MIN_MS);
      if (!loaded) target = Math.min(target, 0.85); // stall until the page has actually loaded
      const want = Math.floor(target * SEGMENTS);
      // chunky, uneven stepping like an old disk read
      if (want > shown && Math.random() < 0.7) setSegs(Math.min(want, shown + 1 + (Math.random() < 0.2 ? 1 : 0)));
      if (shown >= SEGMENTS || elapsed > MAX_MS) return finish();
      later(tick, 70);
    };

    window.addEventListener('load', onLoad);
    boot.addEventListener('click', finish);
    window.addEventListener('keydown', finish, { once: true });
    tick();

    return () => {
      timers.forEach((t) => clearTimeout(t));
      window.removeEventListener('load', onLoad);
      window.removeEventListener('keydown', finish);
      boot.removeEventListener('click', finish);
      boot.removeEventListener('animationend', onAnimEnd);
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div className="boot" id="boot" ref={bootRef} role="status" aria-live="polite" aria-label="Loading">
      <div className="crt">
        <div className="crt-flash" aria-hidden="true"></div>
        <span className="boot-skip rgb" aria-hidden="true">PRESS ANY KEY<span>_</span></span>
        <div className="boot-logo">
          <svg viewBox="0 0 120 64" aria-hidden="true">
            <defs><clipPath id="disc"><ellipse cx="60" cy="32" rx="58" ry="31" /></clipPath></defs>
            <g clipPath="url(#disc)" fill="#efe6d2">
              <rect x="34" y="1" width="90" height="4" />
              <rect x="22" y="8" width="100" height="4" />
              <rect x="6" y="15" width="116" height="4" />
              <rect x="18" y="22" width="104" height="4" />
              <rect x="0" y="29" width="122" height="4" />
              <rect x="10" y="36" width="112" height="4" />
              <rect x="4" y="43" width="118" height="4" />
              <rect x="16" y="50" width="106" height="4" />
              <rect x="28" y="57" width="94" height="4" />
            </g>
          </svg>
          <span className="boot-word rgb">NIVED</span>
        </div>
        <p className="boot-meta rgb">Nived, Freelance Web Developer<br />Version 1.02</p>
        <div className="boot-bar" id="bootBar" ref={barRef} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
          {Array.from({ length: SEGMENTS }, (_, i) => <i key={i} />)}
        </div>
        <p className="boot-copy rgb">Copyright (c) Nived, 2026. All Rights Reserved.</p>
      </div>
    </div>
  );
}
