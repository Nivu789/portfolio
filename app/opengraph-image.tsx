import { ImageResponse } from 'next/og';

/* the preview card shown when the site is shared on WhatsApp, LinkedIn, X, Slack... */
export const alt = 'Nived, freelance web developer in Kochi, Kerala';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'edge';

const STRIPES = ['#ff4d6d', '#ff9f43', '#ffd166', '#4cc9f0'];

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 96px', color: '#fbf3ea', fontFamily: 'Georgia, serif',
          background: 'radial-gradient(80% 90% at 75% 70%, #2a1a1c, #0b0706 75%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 44 }}>
          {STRIPES.map((c, i) => (
            <div key={c} style={{ width: i === 0 || i === 3 ? 150 : 180, height: 14, borderRadius: 7, background: c, marginLeft: i === 0 || i === 3 ? 15 : 0 }} />
          ))}
        </div>
        <div style={{ fontSize: 116, fontStyle: 'italic', letterSpacing: 2, textShadow: '0 0 30px rgba(255,196,140,.55)' }}>NIVED</div>
        <div style={{ fontSize: 46, marginTop: 18, maxWidth: 900, lineHeight: 1.2 }}>
          Freelance web developer. Websites, online stores and web apps, hand-built.
        </div>
        <div style={{ fontSize: 30, marginTop: 34, color: '#ffd166', letterSpacing: 4 }}>KOCHI, KERALA · WORKING WORLDWIDE</div>
      </div>
    ),
    size,
  );
}
