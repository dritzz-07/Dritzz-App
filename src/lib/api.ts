export const getApiUrl = (path: string) => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('run.app')) {
      return path;
    }
    // If loaded elsewhere (Shopify storefront, custom domains, embeds),
    // route API calls to the fully functional deployment container.
    return `https://ais-pre-vdp2yhwtd63fnwp6tu2fg5-382785384176.asia-southeast1.run.app${path}`;
  }
  return path;
};
