import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Hook to fetch CMS page content with fallback to defaults.
 *
 * Usage:
 *   const { content, isLoading } = usePageContent("home", DEFAULT_HOME_CONTENT);
 *
 * Returns CMS content if available, otherwise falls back to the provided defaults.
 * This means pages work immediately with hardcoded data, and switch to CMS data
 * once an admin saves content through the Page Content editor.
 */
export function usePageContent(pageKey, defaults = {}) {
  const { data, isLoading } = useQuery({
    queryKey: ["pageContent", pageKey],
    queryFn: async () => {
      try {
        const results = await base44.entities.PageContent.filter({ page_key: pageKey }, null, 1);
        return results.length > 0 ? results[0].content : null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Deep merge: CMS content overrides defaults, but missing keys fall back to defaults
  const content = data ? deepMerge(defaults, data) : defaults;

  return { content, isLoading, hasCmsData: !!data };
}

export function useSiteSettings(defaults = {}) {
  const { data, isLoading } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      try {
        const settings = await base44.entities.SiteSettings.list(null, 1);
        return settings.length > 0 ? settings[0].settings : null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const settings = data ? { ...defaults, ...data } : defaults;

  return { settings, isLoading, hasCmsData: !!data };
}

export function useTestimonials() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["testimonials", "public"],
    queryFn: async () => {
      try {
        return await base44.entities.Testimonial.list("sort_order");
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { testimonials: data, isLoading };
}

// Deep merge utility — arrays from source replace target arrays entirely
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined && source[key] !== null) {
      result[key] = source[key];
    }
  }
  return result;
}