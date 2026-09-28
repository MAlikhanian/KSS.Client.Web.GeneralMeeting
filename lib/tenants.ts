/**
 * Tenant branding resolution.
 *
 * The Shell is deployed once and serves several tenant hostnames. Each tenant
 * gets its own logo, favicon and sign-in banner without a rebuild: the mapping
 * lives in the TENANTS environment variable (a ConfigMap key in Kubernetes),
 * exactly the same deployment pattern as ZONES.
 *
 * RUNTIME: resolve tenants from a Node-runtime server component (app/layout.tsx),
 * which is where every caller does it today.
 *
 * An earlier note here claimed process.env is unavailable to middleware.ts in the
 * Edge runtime. That is NOT true of this self-hosted deployment: middleware.ts
 * reads process.env.ZONES at module scope and the rewrite demonstrably works in
 * production (a zone health route answers 200 through the Shell, which is only
 * possible if ZONES parsed to a non-empty object there). Corrected 2026-08-29 so
 * nobody designs around a constraint this cluster does not have.
 *
 * IMPORTANT — asset paths are ROOT-RELATIVE and must stay that way. They are
 * deliberately NOT passed through toAbsoluteUrl(), which prepends
 * NEXT_PUBLIC_BASE_PATH — a hardcoded origin in this app
 * (http://localhost:3000/ in dev, https://erp.seba.ir/ in prod). Sending one
 * tenant to another tenant's host for its own logo is the bug this avoids: a
 * root-relative path is always served by whichever host the visitor is on.
 *
 * Shape of TENANTS (keys are hostnames, without port):
 *
 *   {
 *     "spmoffice.ir": {
 *       "name":       "SPM",
 *       "logo":       "/media/tenants/spm/logo.svg",
 *       "logoDark":   "/media/tenants/spm/logo-dark.svg",
 *       "logoMini":   "/media/tenants/spm/logo-mini.svg",
 *       "favicon":    "/media/tenants/spm/favicon.svg",
 *       "banner":     "/media/tenants/spm/banner.svg",
 *       "bannerDark": "/media/tenants/spm/banner-dark.svg",
 *       "tagline":    "optional line under the name",
 *       "footer": {
 *         "brand": { "label": "SPM", "href": "https://spmoffice.ir" },
 *         "links": [
 *           { "fa": "پشتیبانی", "en": "Support", "href": "https://..." }
 *         ]
 *       }
 *     }
 *   }
 *
 * Footer labels are DATA supplied per deployment, exactly like `name` - not UI
 * strings - so both languages travel with the value rather than through i18n.
 * A host with no `footer` renders the app's built-in default footer unchanged.
 *
 * Any host that is not listed renders the stock artwork — i.e. the app exactly
 * as it looked before tenant branding existed. A missing, empty or malformed
 * TENANTS value degrades to that same default: branding must never be able to
 * break sign-in or the shell chrome.
 */

/**
 * One link in a tenant's footer row. `fa` and `en` are the label in each
 * language: these are per-deployment DATA, like `name`, so they travel with the
 * value instead of needing an i18n key per tenant.
 */
export type TenantFooterLink = {
  fa: string;
  en: string;
  /**
   * Optional. An entry whose URL is not known yet is configured with href ''
   * and renders as PLAIN TEXT rather than a dead link. It must not be dropped:
   * dropping it would fall the host back to the built-in defaults, which are
   * SEBA's - i.e. one tenant would show another tenant's footer.
   */
  href?: string;
};

/**
 * A tenant's footer. Either half may be supplied alone.
 *   brand  - replaces the built-in brand link.
 *   links  - replaces the WHOLE built-in link row. An explicit [] renders no
 *            links at all, which is different from omitting the key (built-in
 *            row renders).
 */
export type TenantFooter = {
  brand?: { label: string; href?: string };
  links?: TenantFooterLink[];
};

export type Tenant = {
  /** Display name of the tenant. Data supplied per deployment, not a UI label. */
  name: string;
  /** Wide logo for the expanded sidebar, light theme. */
  logo?: string;
  /** Wide logo for the expanded sidebar, dark theme. Falls back to `logo`. */
  logoDark?: string;
  /** Square logo for the collapsed sidebar and the mobile header. */
  logoMini?: string;
  /** Browser tab icon. */
  favicon?: string;
  /** Sign-in banner background, light theme. */
  banner?: string;
  /** Sign-in banner background, dark theme. Falls back to `banner`. */
  bannerDark?: string;
  /** Optional supporting line rendered under the name on the sign-in banner. */
  tagline?: string;
  /**
   * The Company this host is bound to. When set, the active company is decided
   * by the hostname rather than by the user, the company picker is hidden, and
   * the saved cookie/localStorage choice is ignored.
   *
   * NOT a security boundary. The x-company-id cookie is written client-side and
   * is user-editable, so this only settles the honest case. The Person service
   * must reject an X-Company-Id that is not both a CompanyPerson link of the
   * caller and the company bound to the requested host.
   */
  companyId?: string;
  /**
   * Per-tenant footer. Omitted -> the app's built-in footer renders unchanged,
   * so a tenant that never configures one is unaffected.
   */
  footer?: TenantFooter;
};

/** The stock artwork used when a host has no tenant entry. */
export const DEFAULT_LOGO = '/media/app/default-logo.svg';
export const DEFAULT_LOGO_DARK = '/media/app/default-logo-dark.svg';
export const DEFAULT_LOGO_MINI = '/media/app/mini-logo.svg';
export const DEFAULT_FAVICON = '/favicon.ico';
export const DEFAULT_BANNER = '/media/images/2600x1600/1.png';
export const DEFAULT_BANNER_DARK = '/media/images/2600x1600/1-dark.png';

/** Every branded surface, already resolved against the stock fallbacks. */
export type TenantAssets = {
  name: string | null;
  tagline: string | null;
  logo: string;
  logoDark: string;
  logoMini: string;
  favicon: string;
  banner: string;
  bannerDark: string;
  /** True when the host matched a configured tenant. */
  branded: boolean;
  /** Company bound to this host, or null when the user still chooses. */
  companyId: string | null;
  /** This tenant's footer, or null when the built-in default should render. */
  footer: TenantFooter | null;
};

/**
 * Single source of truth for "which image does this surface show?". Components
 * call this instead of applying their own fallback, so a tenant that sets only
 * some of the assets cannot end up half-branded in an inconsistent way.
 */
export function tenantAssets(tenant?: Tenant | null): TenantAssets {
  return {
    name: tenant?.name ?? null,
    tagline: tenant?.tagline ?? null,
    logo: tenant?.logo ?? DEFAULT_LOGO,
    logoDark: tenant?.logoDark ?? tenant?.logo ?? DEFAULT_LOGO_DARK,
    logoMini: tenant?.logoMini ?? tenant?.logo ?? DEFAULT_LOGO_MINI,
    favicon: tenant?.favicon ?? DEFAULT_FAVICON,
    banner: tenant?.banner ?? DEFAULT_BANNER,
    bannerDark: tenant?.bannerDark ?? tenant?.banner ?? DEFAULT_BANNER_DARK,
    branded: Boolean(tenant),
    companyId: tenant?.companyId ?? null,
    footer: tenant?.footer ?? null,
  };
}

/**
 * Normalises a Host header value to a bare hostname: lowercased, port removed,
 * IPv6 brackets removed, trailing root-dot removed.
 */
export function normalizeHost(host: string | null | undefined): string {
  if (!host) return '';
  let h = host.trim().toLowerCase();
  // IPv6 literal, e.g. [::1]:3000
  if (h.startsWith('[')) {
    const close = h.indexOf(']');
    if (close !== -1) return h.slice(1, close);
  }
  // A Host header may carry several values when proxies chain; take the first.
  const comma = h.indexOf(',');
  if (comma !== -1) h = h.slice(0, comma).trim();
  const colon = h.lastIndexOf(':');
  if (colon !== -1) h = h.slice(0, colon);
  if (h.endsWith('.')) h = h.slice(0, -1);
  return h;
}

/**
 * Validates the optional `footer` block of one tenant. Anything malformed yields
 * undefined so the host falls back to the built-in footer, rather than rendering
 * a half-built row. A link is kept only when fa, en AND href are all present:
 * a link with one language missing would render blank in that language.
 *
 * `links: []` is deliberately preserved as "render no links", which is NOT the
 * same as omitting the key.
 */
function parseFooter(raw: unknown): TenantFooter | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const f = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

  let brand: TenantFooter['brand'];
  if (f.brand && typeof f.brand === 'object' && !Array.isArray(f.brand)) {
    const b = f.brand as Record<string, unknown>;
    const label = str(b.label);
    if (label) brand = { label, href: str(b.href) };
  }

  let links: TenantFooterLink[] | undefined;
  if (Array.isArray(f.links)) {
    links = [];
    for (const item of f.links) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      const l = item as Record<string, unknown>;
      const fa = str(l.fa);
      const en = str(l.en);
      if (fa && en) links.push({ fa, en, href: str(l.href) });
    }
  }

  if (!brand && !links) return undefined;
  return { brand, links };
}

/** Parses the TENANTS env var. Never throws — a bad value yields no tenants. */
export function parseTenants(raw: string | undefined = process.env.TENANTS): Record<string, Tenant> {
  if (!raw || !raw.trim()) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('[tenants] TENANTS is not valid JSON — falling back to default branding');
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.error('[tenants] TENANTS is not a JSON object — falling back to default branding');
    return {};
  }

  const out: Record<string, Tenant> = {};
  for (const [host, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const t = value as Record<string, unknown>;
    if (typeof t.name !== 'string' || !t.name.trim()) continue;
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
    out[normalizeHost(host)] = {
      name: t.name.trim(),
      logo: str(t.logo),
      logoDark: str(t.logoDark),
      logoMini: str(t.logoMini),
      favicon: str(t.favicon),
      banner: str(t.banner),
      bannerDark: str(t.bannerDark),
      tagline: str(t.tagline),
      companyId: str(t.companyId),
      footer: parseFooter(t.footer),
    };
  }
  return out;
}

/**
 * Resolves the tenant for an incoming host. Returns null when the host has no
 * entry, which callers render as the untouched default artwork.
 */
export function resolveTenant(
  host: string | null | undefined,
  tenants: Record<string, Tenant> = parseTenants(),
): Tenant | null {
  const key = normalizeHost(host);
  if (!key) return null;
  return tenants[key] ?? null;
}
