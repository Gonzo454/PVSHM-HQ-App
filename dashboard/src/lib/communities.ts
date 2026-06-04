/**
 * Park Vista Senior Housing Management — Community Definitions
 *
 * 8 communities across WI, IA, and IL offering independent living,
 * assisted living, and memory care.
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
    name: "Noel Manor",
    slug: "noel-manor",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "Noel Manor The Legacy",
    slug: "noel-manor-legacy",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Memory Care"],
  },
  {
    name: "Park Vista Camanche",
    slug: "park-vista-camanche",
    location: "IA",
    state: "Iowa",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "Park Vista North Hill",
    slug: "park-vista-north-hill",
    location: "IA",
    state: "Iowa",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "Park Vista The Legacy",
    slug: "park-vista-legacy",
    location: "IA",
    state: "Iowa",
    careTypes: ["Memory Care"],
  },
  {
    name: "Park Vista Waupaca",
    slug: "park-vista-waupaca",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living", "Assisted Living"],
  },
  {
    name: "The Legacy of DeForest",
    slug: "legacy-of-deforest",
    location: "WI",
    state: "Wisconsin",
    careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
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
