# Retro Portfolio (Next.js)

A retro-computer portfolio: a CRT boot screen, a 3D monitor hero with a waving brick figure, one scroll that zooms straight into **Project Hunt** (a maze game where each folder is a project), a CRT glitch-and-shutter transition into About, and the whole page behind curved CRT glass.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

Next.js 14 (App Router), React 18, TypeScript, three.js 0.128.

## Where things live

| File | What it is |
| --- | --- |
| `lib/content.ts` | **Edit this first.** The six maze projects (title, type, folder colour, link) and the client logos. |
| `components/RetroSite.tsx` | All page markup: nav, hero copy, game shell, About, contact. |
| `components/BootLoader.tsx` | The blue CRT boot screen. Fires a `boot:off` event when it powers off. |
| `lib/engine.js` | The 3D monitor, scroll zoom, maze game, project windows, glitch transition and About figure. Returns a `destroy()` so React can unmount it cleanly. |
| `app/globals.css` | All styles, including the page-wide `.crt-glass` overlay. |
| `public/clients/` | Put client logo files here. |

## Adding client logos

1. Drop the files into `public/clients/` (SVG or transparent PNG work best).
2. List them in `lib/content.ts`:

```ts
export const CLIENTS: Client[] = [
  { name: 'Acme', logo: '/clients/acme.svg', href: 'https://acme.com' },
];
```

Empty "Client logo" slots fill the grid until you have `CLIENT_SLOTS` (8) logos.

## Notes

- **Fonts** load from Google Fonts with a `<link>` in `app/layout.tsx`, not `next/font`. The game and monitor canvases draw text using the literal family names `VT323` and `Newsreader`, and `next/font` renames families.
- **three.js is pinned to 0.128.0** because the engine uses APIs from that release (`sRGBEncoding`, `outputEncoding`). Upgrading three means updating those calls.
- The engine finds elements by `id`, so keep the ids in `RetroSite.tsx` if you restyle the markup.
- `prefers-reduced-motion` is respected: the boot screen, transitions and idle animations calm down or skip.
- Branding ("Nived") is in `BootLoader.tsx`, `RetroSite.tsx`, `app/layout.tsx` and a few canvas strings in `lib/engine.js` (search for `NIVED`).
