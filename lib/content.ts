/**
 * Everything you are likely to edit lives here.
 */

export type Project = {
  title: string;
  /** shown under the title in the project window */
  type: string;
  /** colour of the folder sticker in the maze and the window */
  color: string;
  /** "Open project" link */
  href: string;
};

/** The six folders hidden in the Project Hunt maze. */
export const PROJECTS: Project[] = [
  { title: 'Maximum Effort', type: 'Headless Shopify store', color: '#ff4d5e', href: 'https://headless-tau-drab.vercel.app/' },
  { title: 'Pathways', type: 'Civil services academy', color: '#3fcf8e', href: 'https://pathways.pintechdigital.com/' },
  { title: 'Samskrithi', type: 'Cultural community platform', color: '#ffd166', href: 'https://www.samskrithipulllur.co.in/' },
  { title: 'Huddle', type: 'Office plans app', color: '#b49bff', href: 'https://huddle-iota-roan.vercel.app/' },
];

export type Client = {
  name: string;
  /** path under /public (e.g. "/clients/acme.svg") or a full URL */
  logo: string;
  href?: string;
};

/**
 * Client logos for the About section. Drop files into /public/clients and list them here.
 * Empty slots are shown until there are at least CLIENT_SLOTS logos.
 */
export const CLIENTS: Client[] = [
  // { name: 'Acme', logo: '/clients/acme.svg', href: 'https://acme.com' },
];

export const CLIENT_SLOTS = 8;

/**
 * How people reach you. Leave a field as '' to hide its footer link. The form itself sends to CONTACT_TO_EMAIL (see .env.example).
 * TODO: replace these placeholders with your real details.
 */
export type Contact = {
  email: string;
  whatsapp?: string;
  linkedin?: string;
  github?: string;
  location: string;
  replyTime: string;
};

export const CONTACT: Contact = {
  email: 'nivuyt789@gmail.com',
  /** digits only, with country code, e.g. '919876543210' */
  whatsapp: '919778385740',
  // linkedin: 'https://www.linkedin.com/in/your-handle',
  // github: 'https://github.com/your-handle',
  location: 'Kochi, Kerala · working with clients worldwide',
  replyTime: 'Usually replies within 24 hours',
};

export type Service = {
  title: string;
  blurb: string;
  tags: string[];
  /** stripe colour, from the logo palette */
  color: string;
};

/** "What I can build for you" cards. */
export const SERVICES: Service[] = [
  {
    title: 'Business websites',
    blurb: 'Fast, good-looking sites that explain what you do and turn visitors into enquiries. Built to rank and easy to update.',
    tags: ['Next.js', 'SEO', 'Analytics'],
    color: '#ff4d6d',
  },
  {
    title: 'Online stores',
    blurb: 'Shopify and headless stores with custom product pages, filters and checkout flows that feel like your brand.',
    tags: ['Shopify', 'Headless', 'Payments'],
    color: '#ff9f43',
  },
  {
    title: 'Web apps & portals',
    blurb: 'Dashboards, booking systems, member areas and internal tools, with logins and a real database behind them.',
    tags: ['TypeScript', 'MongoDB', 'APIs'],
    color: '#ffd166',
  },
  {
    title: 'CMS your team can use',
    blurb: 'Edit text, images, courses or products yourself, without calling a developer for every change.',
    tags: ['Headless CMS', 'Admin panels'],
    color: '#4cc9f0',
  },
  {
    title: 'Interactive & 3D',
    blurb: 'Launch pages, product showcases and small games, like the one you just played, that people remember.',
    tags: ['WebGL', 'Three.js', 'Motion'],
    color: '#b49bff',
  },
  {
    title: 'Care & hosting',
    blurb: 'Domain, hosting, backups and updates handled for you, plus fixes and new features after launch.',
    tags: ['Hosting', 'Maintenance'],
    color: '#3fcf8e',
  },
];

export type Step = { title: string; body: string };

/** "How it works", shown as a boot log. */
export const PROCESS: Step[] = [
  { title: 'Intro call', body: 'A free 20-minute call about your business, your goals and what the site needs to do.' },
  { title: 'Plan & quote', body: 'A clear scope, timeline and fixed price in writing, so there are no surprises later.' },
  { title: 'Design & build', body: 'You get a live preview link early and see progress every week, with room for feedback.' },
  { title: 'Launch & support', body: 'I put it live, show your team how to edit it, and stay around for fixes and updates.' },
];

export type Faq = { q: string; a: string };

/** TODO: adjust the answers (prices, timelines) to how you actually work. */
export const FAQS: Faq[] = [
  {
    q: 'How much does a website cost?',
    a: 'It depends on the size and features. After a short call you get a fixed quote, so you know the full price before any work starts.',
  },
  {
    q: 'How long does it take?',
    a: 'A typical business site takes 2 to 4 weeks. Stores and web apps take longer; the timeline is agreed up front in the plan.',
  },
  {
    q: 'Can I update the site myself?',
    a: 'Yes. Most sites come with a simple editor for text, images and pages, and I show your team how to use it.',
  },
  {
    q: 'Do you work with clients outside India?',
    a: 'Yes. I work remotely with clients in India, the UAE and elsewhere, with calls at a time that suits your timezone.',
  },
  {
    q: 'What happens after launch?',
    a: 'You own the site and the code. I can look after hosting, backups and updates on a monthly plan, or hand it over completely.',
  },
];
