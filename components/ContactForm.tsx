'use client';

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { CONTACT, PACKAGES, SERVICES } from '@/lib/content';

type Status = { kind: 'idle' | 'sending' | 'sent' | 'error'; text?: string };

/** The contact section's form. Posts to app/api/contact, which emails it to you through Resend. */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);

  /* a pricing card's button pre-selects its package here */
  useEffect(() => {
    const onPick = (e: Event) => {
      const radio = formRef.current?.querySelector<HTMLInputElement>(`input[name="package"][value="${(e as CustomEvent<string>).detail}"]`);
      if (radio) radio.checked = true;
    };
    window.addEventListener('pick-package', onPick);
    return () => window.removeEventListener('pick-package', onPick);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send right now.');
      form.reset();
      setStatus({ kind: 'sent' });
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'Could not send right now.' });
    }
  }

  const sending = status.kind === 'sending';

  return (
    <form className="cform reveal" onSubmit={onSubmit} ref={formRef}>
      <div className="cform-row">
        <label className="cfield">
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required maxLength={100} placeholder="Your name" />
        </label>
        <label className="cfield">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@company.com" />
        </label>
      </div>
      <div className="cform-row">
        <label className="cfield">
          <span>Company <i>optional</i></span>
          <input name="company" type="text" autoComplete="organization" maxLength={120} placeholder="Business or brand" />
        </label>
        <label className="cfield">
          <span>Project type</span>
          <select name="service" defaultValue="">
            <option value="">Not sure yet</option>
            {SERVICES.map((s) => <option key={s.title} value={s.title}>{s.title}</option>)}
          </select>
        </label>
      </div>
      <fieldset className="cfield cpkg">
        <legend>Package</legend>
        <div className="cpkg-opts">
          {PACKAGES.map((p) => (
            <label key={p.name} style={{ '--c': p.color } as CSSProperties}>
              <input type="radio" name="package" value={p.name} />
              <span><b>{p.name}</b><small>from {p.price}</small></span>
            </label>
          ))}
          <label>
            <input type="radio" name="package" value="" defaultChecked />
            <span><b>Not sure</b><small>help me choose</small></span>
          </label>
        </div>
      </fieldset>
      <label className="cfield">
        <span>Project details</span>
        <textarea
          name="message" required minLength={10} maxLength={5000} rows={5} data-lenis-prevent
          placeholder="What are you building, and when do you need it?"
        />
      </label>
      {/* honeypot for bots; hidden from people and screen readers */}
      <label className="cform-hp" aria-hidden="true">
        Website <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="cform-foot">
        <button className="btn" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</button>
        <p className={`cform-status ${status.kind}`} role="status" aria-live="polite">
          {status.kind === 'idle' && <>&gt; {CONTACT.replyTime.toUpperCase()}</>}
          {status.kind === 'sending' && <>&gt; TRANSMITTING<i className="term-cursor" /></>}
          {status.kind === 'sent' && <>&gt; MESSAGE RECEIVED. TALK SOON.</>}
          {status.kind === 'error' && (
            <>
              &gt; ERROR: {status.text}
              {CONTACT.email && <> Or email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</>}
            </>
          )}
        </p>
      </div>
    </form>
  );
}
