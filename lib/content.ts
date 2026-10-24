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

export type Package = {
  name: string;
  /** starting price, shown as written */
  price: string;
  bestFor: string;
  /** first line is shown highlighted when it starts with "Everything in" */
  features: string[];
  color: string;
  /** gets the highlighted card; set on one package or none */
  featured?: boolean;
};

/** Pricing section, from the website proposal. */
export const PACKAGES: Package[] = [
  {
    name: 'Growth',
    price: '₹15,000',
    bestFor: 'Best for getting online quickly.',
    color: '#ff9f43',
    features: [
      '3-page website: Home, About and Contact',
      'Enquiry form to WhatsApp or email',
      'Mobile-friendly design',
      'Basic search setup (page titles and descriptions)',
      '1 round of design changes',
      '3 months of support after launch',
    ],
  },
  {
    name: 'Pro',
    price: '₹25,000',
    bestFor: 'Best for businesses that want to be found and to stand out.',
    color: '#ffd166',
    featured: true,
    features: [
      'Everything in Growth',
      'Google Maps and Google Business link-up',
      'Extra pages: gallery, services, testimonials',
      'Local search setup for your area, with structured data',
      'Visitor analytics',
      'Admin panel to edit your content, prices and photos yourself',
      '2 rounds of design changes',
      '3 months of support after launch',
    ],
  },
  {
    name: 'Premium',
    price: '₹50,000',
    bestFor: 'Best for businesses that want their website to handle bookings and payments.',
    color: '#4cc9f0',
    features: [
      'Everything in Pro',
      'Online booking (appointments, classes or orders)',
      'Customer login area with their plans, bookings and history',
      'Online payment links',
      'Blog for tips and news',
      'Monthly performance report',
      '3 rounds of design changes',
      '3 months of support after launch',
    ],
  },
];

/** The small print under the packages. */
export const PRICING_NOTES: { title: string; body: string }[] = [
  { title: 'Starting prices', body: 'The final price depends on things like the number of pages or special features. I confirm it in writing before we begin.' },
  { title: 'Hosting & domain', body: 'Not included in any package. Charged at cost, yearly at the registrar’s rate. I tell you the exact amount first and set both up for you.' },
  { title: 'Payment', body: '50% advance to start, the rest on launch.' },
  { title: 'Ownership', body: 'The website and content are yours once the final payment is made. Extra changes are quoted first, never charged without your approval.' },
];

export type Faq = { q: string; a: string };

/** TODO: adjust the answers (prices, timelines) to how you actually work. */
export const FAQS: Faq[] = [
  {
    q: 'How much does a website cost?',
    a: 'Packages start at ₹15,000 (see Pricing above). The final price depends on the pages and features you need, and you get it in writing before any work starts.',
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
