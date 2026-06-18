// NovaPower editorial / blog content. In production this would come from a CMS
// or the DY content feed; here it's a static module so the /blog index and the
// /blog/:slug article pages can render directly. Images are verified Pexels IDs.

const IMG = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

export type BlogCategory =
  | 'Energy savings'
  | 'Offers'
  | 'Connectivity'
  | 'Mobility'
  | 'Smart home'
  | 'Insurance'
  | 'Sustainability';

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  image: string;
  author: string;
  authorRole: string;
  date: string; // ISO
  readingMins: number;
  tags: string[];
  featured?: boolean;
  relatedSkus: string[];
  body: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: '7-ways-to-cut-your-energy-bill-before-winter',
    title: '7 ways to cut your energy bill before winter',
    excerpt:
      'Small habits and a couple of smart upgrades can shave up to 30% off your heating bill. Here is where to start before the cold hits.',
    category: 'Energy savings',
    image: IMG('30373108'),
    author: 'Marta Ríos',
    authorRole: 'Energy advisor',
    date: '2026-06-02',
    readingMins: 6,
    featured: true,
    tags: ['heating', 'savings', 'winter', 'efficiency'],
    relatedSkus: ['ELEC-GREEN-100', 'SH-THERMO', 'SH-SOLAR-3K'],
    body: [
      {
        paragraphs: [
          'When temperatures drop, heating can account for more than half of a household electricity bill. The good news: most of that spend is controllable. A mix of behaviour changes and a few connected devices can cut a typical winter bill by 20–30% without sacrificing comfort.',
        ],
      },
      {
        heading: '1. Let a smart thermostat do the thinking',
        paragraphs: [
          'A learning thermostat lowers the temperature automatically when you are out or asleep and warms the house back up just before you need it. Households that switch typically save 8–12% on heating in the first year — often paying back the device in a single season.',
        ],
      },
      {
        heading: '2. Shift heavy usage to off-peak hours',
        paragraphs: [
          'If you are on a time-of-use tariff, running the dishwasher, washing machine and EV charger overnight can move 30–40% of your consumption to the cheapest hours of the day.',
        ],
      },
      {
        heading: '3. Match your tariff to how you actually live',
        paragraphs: [
          'A fixed-price plan protects you from winter price spikes, while a green night tariff rewards off-peak users. The right plan is the single biggest lever on your bill — and switching with NovaPower takes about five minutes.',
        ],
        bullets: [
          'Mostly home during the day? A fixed plan keeps things predictable.',
          'Out all day, EV at night? A night/off-peak plan wins.',
          'Have solar? Pair it with a battery to self-consume the evening peak.',
        ],
      },
      {
        heading: 'The bottom line',
        paragraphs: [
          'You do not need to renovate your home to spend less. Start with a smart thermostat and the right tariff, layer in off-peak habits, and let the savings compound through the coldest months.',
        ],
      },
    ],
  },
  {
    slug: 'pay-with-mastercard-save-more',
    title: 'Pay with Mastercard, save more: how NovaPower rewards work',
    excerpt:
      'Settle any NovaPower plan with an eligible Mastercard and unlock an automatic 10% discount on your first three months — plus Priceless extras.',
    category: 'Offers',
    image: IMG('3907119'),
    author: 'Diego Salas',
    authorRole: 'Partnerships lead',
    date: '2026-06-10',
    readingMins: 4,
    featured: false,
    tags: ['mastercard', 'discount', 'rewards', 'payments'],
    relatedSkus: ['BND-DUAL-FM', 'BND-TRIPLE', 'FIBER-1G'],
    body: [
      {
        paragraphs: [
          'We have teamed up with Mastercard to make switching to NovaPower even more rewarding. Choose an eligible Mastercard at checkout and we automatically apply a 10% discount to your first three months — no codes, no forms.',
        ],
      },
      {
        heading: 'How the discount works',
        paragraphs: [
          'The offer is applied the moment you select Mastercard as your payment method. You will see the new monthly price update live in your order summary before you confirm.',
        ],
        bullets: [
          '10% off your first 3 months on any plan or bundle',
          'Stacks with our bundle savings of up to 30%',
          'Available to both residential and business customers',
        ],
      },
      {
        heading: 'Priceless extras',
        paragraphs: [
          'Beyond the discount, paying with Mastercard unlocks access to Priceless experiences and partner offers — from EV charging credits to travel perks that pair nicely with our roaming add-ons.',
        ],
      },
      {
        heading: 'Security you can count on',
        paragraphs: [
          'Every Mastercard payment is protected by tokenised transactions and zero-liability fraud protection, so your switch is as safe as it is cheap.',
        ],
      },
    ],
  },
  {
    slug: 'fiber-vs-5g-which-is-right-for-your-home',
    title: 'Fiber vs 5G: which connection is right for your home?',
    excerpt:
      'Both are fast, but they win in different scenarios. Here is a clear, no-jargon way to pick the connection that fits your home.',
    category: 'Connectivity',
    image: IMG('12932191'),
    author: 'Lucía Fernández',
    authorRole: 'Network engineer',
    date: '2026-05-28',
    readingMins: 5,
    featured: false,
    tags: ['fiber', '5g', 'broadband', 'mobile'],
    relatedSkus: ['FIBER-1G', 'FIBER-600', 'MOB-UNL'],
    body: [
      {
        paragraphs: [
          'Fiber and 5G can both deliver gigabit-class speeds, but they solve different problems. The right choice depends on where you live, how many devices you run, and whether you need to move your connection around.',
        ],
      },
      {
        heading: 'When fiber wins',
        paragraphs: [
          'For a busy household streaming 4K, gaming and working from home at the same time, fiber is unbeatable: symmetrical speeds, ultra-low latency and no data caps.',
        ],
      },
      {
        heading: 'When 5G wins',
        paragraphs: [
          'If you move often, live somewhere fiber has not reached, or want a backup line that just works, 5G home internet is plug-and-play and surprisingly fast.',
        ],
      },
      {
        heading: 'Why not both?',
        paragraphs: [
          'Our most popular bundle pairs Fiber 1 Gb with unlimited 5G mobile, so you get a rock-solid home line and a fast connection in your pocket — billed together, and cheaper than buying them apart.',
        ],
      },
    ],
  },
  {
    slug: 'guide-to-charging-your-ev-at-home',
    title: 'The complete guide to charging your EV at home',
    excerpt:
      'Home charging is cheaper, more convenient and kinder to your battery. Here is how to set it up the smart way.',
    category: 'Mobility',
    image: IMG('38099163'),
    author: 'Pablo Marín',
    authorRole: 'E-mobility specialist',
    date: '2026-05-20',
    readingMins: 7,
    featured: false,
    tags: ['ev', 'charging', 'mobility', 'solar'],
    relatedSkus: ['SH-EV-7K', 'SH-EV-22K', 'ELEC-NIGHT'],
    body: [
      {
        paragraphs: [
          'Charging at home overnight is the single biggest reason EV owners say running costs feel almost free. With the right wallbox and tariff, a full charge can cost a fraction of public charging.',
        ],
      },
      {
        heading: 'Pick the right wallbox',
        paragraphs: [
          'A 7 kW charger fully tops up most EVs overnight and suits single-phase homes. If you have three-phase power and a bigger battery, a 22 kW unit charges in a couple of hours.',
        ],
      },
      {
        heading: 'Charge when energy is cheapest',
        paragraphs: [
          'Pair your wallbox with a night or off-peak tariff and schedule charging for the small hours. Add solar and a battery, and you can drive on sunshine you stored earlier in the day.',
        ],
      },
    ],
  },
  {
    slug: 'smart-home-starter-kit',
    title: 'Smart home starter kit: 5 devices that pay for themselves',
    excerpt:
      'You do not need a full renovation to make your home smarter and cheaper to run. Start with these five connected devices.',
    category: 'Smart home',
    image: IMG('248528'),
    author: 'Nora Vidal',
    authorRole: 'Smart home editor',
    date: '2026-05-12',
    readingMins: 5,
    featured: false,
    tags: ['smart home', 'automation', 'savings'],
    relatedSkus: ['SH-THERMO', 'SH-PLUG', 'SH-LEAK'],
    body: [
      {
        paragraphs: [
          'The best smart home upgrades are not the flashiest — they are the ones that quietly trim your bills and prevent expensive accidents. Here is where the money actually comes back.',
        ],
      },
      {
        heading: 'The five that earn their keep',
        paragraphs: ['Each of these pays for itself within a year for most homes:'],
        bullets: [
          'Smart thermostat — cuts heating waste automatically',
          'Smart plugs — kill standby power on TVs and consoles',
          'Leak sensor — catches a drip before it becomes a flood',
          'Smart lighting — schedules and dims to match daylight',
          'Energy monitor — shows you exactly where the watts go',
        ],
      },
    ],
  },
  {
    slug: 'do-you-really-need-gadget-and-home-insurance',
    title: 'Do you really need gadget & home insurance?',
    excerpt:
      'Phones, laptops and home appliances are pricier than ever to replace. Here is how to decide what is worth insuring — and what is not.',
    category: 'Insurance',
    image: IMG('8525000'),
    author: 'Elena Cano',
    authorRole: 'Insurance advisor',
    date: '2026-05-04',
    readingMins: 6,
    featured: false,
    tags: ['insurance', 'devices', 'home', 'protection'],
    relatedSkus: ['INS-TECH-PHONE', 'INS-HOME-PREMIUM', 'INS-TECH-SMARTHOME'],
    body: [
      {
        paragraphs: [
          'Insurance is about turning a rare, painful cost into a small, predictable one. The trick is insuring the things that would genuinely hurt to replace — and skipping cover you would never claim on.',
        ],
      },
      {
        heading: 'Worth it for most people',
        paragraphs: [
          'A cracked flagship phone screen can cost a few hundred euros. For a few euros a month, device insurance covers accidental damage, theft and breakdown — usually paying out far more than it costs.',
        ],
      },
      {
        heading: 'Bundle and simplify',
        paragraphs: [
          'Managing five policies from five providers is a headache. Bringing your home, device and travel cover under one NovaPower bill means one renewal date, one app, and one number to call.',
        ],
      },
    ],
  },
];

export function findPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export const blogCategories: BlogCategory[] = [
  'Energy savings',
  'Offers',
  'Connectivity',
  'Mobility',
  'Smart home',
  'Insurance',
];

export function formatBlogDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
