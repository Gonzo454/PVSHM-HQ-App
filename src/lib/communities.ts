/**
 * Park Vista Senior Housing Management — Community Definitions
 *
 * 14 communities across WI, IA, and IL offering independent living,
 * assisted living, and memory care.
 *
 * Names MUST match AppFolio property_name exactly for API lookups.
 */

export interface Community {
  name: string;
  slug: string;
  location: string;
  state: string;
  careTypes: string[];
}

export const COMMUNITIES: Community[] = [
  {
    name: "Arborcreek Apartments",
    slug: "arborcreek-apartments",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living"],
  },
  {
    name: "Arborview Court",
    slug: "arborview-court",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living"],
  },
  {
    name: "Arborwood Lodge",
    slug: "arborwood-lodge",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Assisted Living"],
  },
  {
    name: "Camanche",
    slug: "camanche",
    location: "IA",
    state: "Iowa",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "Legacy",
    slug: "legacy",
    location: "IA",
    state: "Iowa",
    careTypes: ["Memory Care"],
  },
  {
    name: "Legacy at Noel Manor",
    slug: "legacy-at-noel-manor",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Memory Care"],
  },
  {
    name: "Legacy of DeForest",
    slug: "legacy-of-deforest",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
  },
  {
    name: "Noel Manor",
    slug: "noel-manor",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "North Hill",
    slug: "north-hill",
    location: "IA",
    state: "Iowa",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "Regency Retirement Residence of Clinton",
    slug: "regency-retirement-clinton",
    location: "IA",
    state: "Iowa",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "The Lodge at Whispering Pines",
    slug: "the-lodge-at-whispering-pines",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "Waupaca",
    slug: "waupaca",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "Whispering Pines",
    slug: "whispering-pines",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living"],
  },
  {
    name: "Willow Lane",
    slug: "willow-lane",
    location: "IL",
    state: "Illinois",
    careTypes: ["Independent Living", "Assisted Living"],
  },
];

export function getCommunityBySlug(slug: string): Community | undefined {
  return COMMUNITIES.find((c) => c.slug === slug);
}

export function getCommunityByName(name: string): Community | undefined {
  return COMMUNITIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}
