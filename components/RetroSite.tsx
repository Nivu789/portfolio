'use client';

import { useEffect, type CSSProperties } from 'react';
import BootLoader from './BootLoader';
import ContactForm from './ContactForm';
import { CONTACT, FAQS, PROCESS, PROJECTS, SERVICES } from '@/lib/content';
import { initRetroSite } from '@/lib/engine';

/**
 * The whole page. React renders the markup once; lib/engine.js finds the pieces by id and runs
 * the 3D monitor, the zoom into the screen, the maze game and the CRT transitions.
 */
export default function RetroSite() {
  useEffect(() => {
    const destroy = initRetroSite(PROJECTS);
    return () => { if (typeof destroy === 'function') destroy(); };
  }, []);

  /* sections below About rise in as they scroll into view; without JS or with reduced motion they just show */
  useEffect(() => {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => { io.disconnect(); root.classList.remove('js-reveal'); };
  }, []);

  return (
    <>
      <BootLoader />

      <div className="track" id="track">
        <section className="stage" id="hero">
          <canvas id="stage" aria-hidden="true"></canvas>

          <header className="nav">
            <a className="brand" href="#hero" data-go="0" aria-label="Nived home">
              <svg viewBox="0 0 48 24" aria-hidden="true">
                <ellipse cx="24" cy="12" rx="22" ry="10" fill="#140b0a" />
                <g strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6h36" stroke="#ff4d6d" /><path d="M3 10h42" stroke="#ff9f43" />
                  <path d="M3 14h42" stroke="#ffd166" /><path d="M5 18h38" stroke="#4cc9f0" />
                </g>
              </svg>
              NIVED
            </a>
            <nav className="menu" aria-label="Primary">
              <a href="#hero" data-go="0" id="navHome" aria-current="page">Home</a>
              <a href="#work" data-go="1" id="navWork">Selected Work</a>
              <a href="#about" data-go="2" id="navAbout">About</a>
              <a href="#services">Services</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="call">
              <svg viewBox="0 0 32 32" fill="#fbf3ea" aria-hidden="true">
                <path d="M4 12c0-3 5-6 12-6s12 3 12 6v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2c-2-1-4-1.3-6-1.3S12 11 10 12v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
                <path d="M9 17h14l2 9H7z" />
                <g fill="#0b0706">
                  <circle cx="13" cy="20" r="1" /><circle cx="16" cy="20" r="1" /><circle cx="19" cy="20" r="1" />
                  <circle cx="13" cy="23" r="1" /><circle cx="16" cy="23" r="1" /><circle cx="19" cy="23" r="1" />
                </g>
              </svg>
              <a href="#contact">Book a call</a>
            </div>
          </header>

          <div className="copy" id="copy">
            <h1>Interactive Worlds, Hand-Built for the Open Web</h1>
            <div className="sub">
              <p>Scroll to Boot Up My Latest Launches</p>
              <div className="hints" aria-hidden="true">
                <svg className="hint-mouse" viewBox="0 0 24 36" fill="none" stroke="#fbf3ea" strokeWidth="1.6">
                  <rect x="2" y="2" width="20" height="32" rx="10" />
                  <rect className="hint-wheel" x="10.5" y="8" width="3" height="6" rx="1.5" fill="#ffd166" stroke="none" />
                </svg>
                <span className="hint-arrows">
                  <i>▼</i><i>▼</i><i>▼</i>
                </span>
              </div>
            </div>
          </div>

          <div className="game" id="work" aria-label="Selected work: Project Hunt game" aria-hidden="true">
            <div className="game-box" id="gameBox">
              <canvas
                id="gameCanvas"
                role="img"
                aria-label={`Project Hunt, a maze game. Collect ${PROJECTS.length} project folders while avoiding bugs. Use the All projects button for a plain list.`}
              ></canvas>
              <div className="gcard" id="gCard" role="dialog" aria-modal="false" aria-labelledby="gCardTitle" hidden></div>
            </div>
            <div className="gbar">
              <p>
                <kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> move · <kbd>P</kbd> pause · open all {PROJECTS.length} folders
              </p>
              <div className="gbtns">
                <button className="gbtn primary" id="gStart" type="button">Start</button>
                <button className="gbtn" id="gList" type="button">All projects</button>
              </div>
            </div>
            <div className="dpad" aria-label="Direction pad">
              <button className="u" type="button" data-dir="up" aria-label="Up">▲</button>
              <button className="l" type="button" data-dir="left" aria-label="Left">◀</button>
              <button className="d" type="button" data-dir="down" aria-label="Down">▼</button>
              <button className="r" type="button" data-dir="right" aria-label="Right">▶</button>
            </div>
          </div>
        </section>
      </div>

      <section className="about" id="about" aria-labelledby="aboutTitle">
        <div className="about-inner">
          <div className="about-copy">
            <p className="eyebrow-a">About</p>
            <h2 id="aboutTitle">Hi, I&apos;m Nived. I build <em>the whole thing.</em></h2>
            <p>
              I&apos;m a freelance full-stack developer based in Kochi, Kerala, building websites for brands, academies and
              local businesses. I work mostly in <b>Next.js, TypeScript and MongoDB</b>.
            </p>
            <p>
              You deal with one person from start to finish: the design, the build, the CMS your team edits and the hosting
              behind it. No hand-offs, and no waiting on an agency to reply.
            </p>
            <p>
              The folders you just opened are a few recent projects. If you have something similar in mind, let&apos;s talk.
            </p>

            <div className="about-cta">
              <a className="btn" href="#contact">Book a call</a>
              <a className="ghost-a" href="#work" data-go="1">Play the work again</a>
            </div>
          </div>
          <figure className="about-fig">
            <canvas id="aboutFig" width={640} height={480} aria-hidden="true"></canvas>
          </figure>
        </div>
      </section>

      <section className="sec" id="services" aria-labelledby="servicesTitle">
        <div className="sec-inner">
          <p className="eyebrow-a reveal">Services</p>
          <h2 className="sec-title reveal" id="servicesTitle">What I can <em>build for you</em></h2>
          <ul className="svc-grid">
            {SERVICES.map((s, i) => (
              <li className="svc reveal" key={s.title} style={{ '--c': s.color } as CSSProperties}>
                <span className="svc-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
                <ul className="svc-tags" aria-label="Tools">
                  {s.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec" id="process" aria-labelledby="processTitle">
        <div className="sec-inner">
          <p className="eyebrow-a reveal">Process</p>
          <h2 className="sec-title reveal" id="processTitle">How a project <em>runs</em></h2>
          <div className="term reveal">
            <div className="term-head" aria-hidden="true">
              <span>NIVED OS</span><span>PROJECT.EXE</span>
            </div>
            <ol className="term-log">
              {PROCESS.map((s, i) => (
                <li key={s.title}>
                  <p className="term-line">
                    <span className="term-step">STEP {String(i + 1).padStart(2, '0')}</span>
                    <span className="term-name">{s.title.toUpperCase()}</span>
                    <span className="term-dots" aria-hidden="true"></span>
                    <span className="term-ok">OK</span>
                  </p>
                  <p className="term-body">{s.body}</p>
                </li>
              ))}
            </ol>
            <p className="term-ready" aria-hidden="true">READY.<i className="term-cursor"></i></p>
          </div>
        </div>
      </section>

      <section className="sec" id="faq" aria-labelledby="faqTitle">
        <div className="sec-inner sec-narrow">
          <p className="eyebrow-a reveal">FAQ</p>
          <h2 className="sec-title reveal" id="faqTitle">Questions clients <em>usually ask</em></h2>
          <div className="faq">
            {FAQS.map((f) => (
              <details className="reveal" key={f.q}>
                <summary><span className="faq-prompt" aria-hidden="true">C:\&gt;</span>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <canvas id="brickWipe" aria-hidden="true" hidden></canvas>
      <div className="crt-glass" aria-hidden="true"></div>

      <section className="outro" id="contact" aria-labelledby="contactTitle">
        <div className="outro-copy">
          <p className="eyebrow-a reveal">Contact</p>
          <h2 className="reveal" id="contactTitle">Got a launch coming up? Let&apos;s build the bit people remember.</h2>
          <p className="reveal">
            Tell me a little about your business and what you need. I&apos;ll reply with a few questions and a time for a
            quick call.
          </p>
        </div>

        <ContactForm />
      </section>

      <footer className="foot">
        <p>© {new Date().getFullYear()} NIVED · {CONTACT.location.split('·')[0].trim().toUpperCase()}</p>
        <nav className="foot-links" aria-label="Elsewhere">
          {CONTACT.email && <a href={`mailto:${CONTACT.email}`}>EMAIL</a>}
          {CONTACT.whatsapp && <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer">WHATSAPP</a>}
          {CONTACT.linkedin && <a href={CONTACT.linkedin} target="_blank" rel="noreferrer">LINKEDIN</a>}
          {CONTACT.github && <a href={CONTACT.github} target="_blank" rel="noreferrer">GITHUB</a>}
          <a href="#hero" data-go="0">BACK TO TOP ▲</a>
        </nav>
      </footer>
    </>
  );
}
