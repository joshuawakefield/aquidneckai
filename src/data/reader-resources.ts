export type ReaderResourceKind = 'Learn' | 'Business' | 'Research';

export interface ReaderResource {
  id: string;
  title: string;
  description: string;
  whyUseful: string;
  href: string;
  organization: string;
  area: string;
  kind: ReaderResourceKind;
  checkedAt: string;
  updatedAt?: string;
}

// Curated starting points, not automatically published news or guaranteed availability.
export const readerResources: readonly ReaderResource[] = [
  {
    id: 'ri-google-ai-training',
    title: 'Apply for no-cost AI training in Rhode Island',
    description: 'Rhode Island residents can apply for online Google AI courses through the state AI Hub. Licenses are limited and awarded by the Hub.',
    whyUseful: 'A place to start learning at your own pace, with eligibility and the application explained by the provider.',
    href: 'https://ai.ri.gov/free-resources/grow-google-rhode-island',
    organization: 'Rhode Island AI Hub',
    area: 'Rhode Island · Online',
    kind: 'Learn',
    checkedAt: '2026-10-05',
  },
  {
    id: 'sba-ai-small-business',
    title: 'Find a practical first use for AI in your business',
    description: 'The SBA explains common business uses, basic AI terms, and risks to consider when trying a tool.',
    whyUseful: 'Use the examples to choose one small task to test, such as drafting marketing copy or organizing routine work.',
    href: 'https://legacy.sba.gov/business-guide/manage-your-business/ai-small-business',
    organization: 'U.S. Small Business Administration',
    area: 'National · Useful locally',
    kind: 'Business',
    checkedAt: '2026-10-05',
    updatedAt: '2025-02-14',
  },
  {
    id: 'ri-ai-business-support',
    title: 'Find Rhode Island support for business AI adoption',
    description: 'The state AI Hub describes its work with business owners and the Rhode Island Small Business Coalition, with a contact route for learning more.',
    whyUseful: 'Ask what support fits your business and whether training is available. This page does not guarantee a current place on a course.',
    href: 'https://ai.ri.gov/programs-initiatives/business',
    organization: 'Rhode Island AI Hub',
    area: 'Rhode Island',
    kind: 'Business',
    checkedAt: '2026-10-05',
  },
  {
    id: 'uri-ai-lab-workshops',
    title: 'Check URI’s AI workshop calendar',
    description: 'The AI Lab lists sessions on prompting, generative AI, data science and related skills, including online events.',
    whyUseful: 'Find a class with a concrete topic. Open the event for its date, intended audience and registration requirements.',
    href: 'https://events.uri.edu/group/ai',
    organization: 'University of Rhode Island',
    area: 'Kingston · Online options',
    kind: 'Learn',
    checkedAt: '2026-10-05',
  },
  {
    id: 'ri-ai-hub-events',
    title: 'See the state AI Hub’s events',
    description: 'The Hub maintains a calendar of its AI workshops and gatherings across Rhode Island.',
    whyUseful: 'Find opportunities to learn with other Rhode Islanders. Check each listing’s audience, location and sign-up details.',
    href: 'https://ai.ri.gov/news-events/events',
    organization: 'Rhode Island AI Hub',
    area: 'Rhode Island',
    kind: 'Learn',
    checkedAt: '2026-10-05',
  },
  {
    id: 'uri-ai-workplace',
    title: 'Explore AI training for your team',
    description: 'URI offers customizable workplace AI training, covering everyday tasks, adoption planning and responsible use. Contact the team about format, availability and cost.',
    whyUseful: 'An option for an employer who wants training built around the work their staff actually do.',
    href: 'https://web.uri.edu/osi/ai/',
    organization: 'URI Office of Strategic Initiatives',
    area: 'Rhode Island · In-person and online',
    kind: 'Business',
    checkedAt: '2026-10-05',
  },
  {
    id: 'brown-data-science-research',
    title: 'Follow AI research and its effects at Brown',
    description: 'Brown’s Data Science Institute shares research, talks and analysis on AI, data science and their effects on society.',
    whyUseful: 'Read work from a nearby university alongside product announcements, including research on AI reliability and public policy.',
    href: 'https://dsi.brown.edu/news',
    organization: 'Brown University',
    area: 'Providence',
    kind: 'Research',
    checkedAt: '2026-10-05',
  },
  {
    id: 'salve-ai-archive',
    title: 'Explore Salve Regina’s AI teaching archive',
    description: 'This Newport collection contains 2023 papers and presentations on ChatGPT, writing assignments and AI research tools.',
    whyUseful: 'Local academic background for educators and curious readers. Treat its tool examples as historical, rather than current product guidance.',
    href: 'https://digitalcommons.salve.edu/aipp/',
    organization: 'Salve Regina University',
    area: 'Newport',
    kind: 'Research',
    checkedAt: '2026-10-05',
  },
];
