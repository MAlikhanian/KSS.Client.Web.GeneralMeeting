'use client';

import { generalSettings } from '@/config/general.config';
import { Container } from '@/components/common/container';
import { useTenant } from '@/providers/tenant-provider';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Footer.
 *
 * The brand link and the link row come from the TENANT when this host has a
 * `footer` entry in TENANTS, and otherwise from the built-in defaults below.
 * Tenant labels are per-deployment DATA carrying both languages (see
 * TenantFooterLink), which is why they are picked by language here rather than
 * going through i18n.
 *
 * NOTE — the built-in defaults are still hardcoded English. That is a known
 * open item, deliberately left: making them translatable was proposed as its own
 * change and not approved, so they stay as the last-resort fallback for a host
 * with no footer entry. Do not read their presence as "hardcoding is fine here".
 */

const DEFAULT_BRAND = { label: 'SEBA', href: 'https://seba.ir' };

const DEFAULT_LINKS = [
  { label: 'Docs', href: generalSettings.docsLink },
  { label: 'Purchase', href: generalSettings.purchaseLink },
  { label: 'FAQ', href: generalSettings.faqLink },
  {
    label: 'Support',
    href: 'https://www.seba.ir/%D8%AA%D9%85%D8%A7%D8%B3-%D8%A8%D8%A7-%DA%A9%D8%A7%D9%86%D9%88%D9%86',
  },
  { label: 'License', href: generalSettings.licenseLink },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { footer } = useTenant();
  const { i18n } = useTranslation();

  // Tenant labels ship both languages; pick by the active one. Anything that is
  // not Persian falls to the English label, matching the app's two-locale set.
  const fa = (i18n?.language ?? '').toLowerCase().startsWith('fa');

  const brand = footer?.brand ?? DEFAULT_BRAND;

  // `links: []` means "this tenant shows no links" and must be honoured; only an
  // ABSENT links key falls back to the defaults. `??` gets that right, `||`
  // would not.
  const links =
    footer?.links?.map((l) => ({ label: fa ? l.fa : l.en, href: l.href })) ??
    DEFAULT_LINKS;

  return (
    <footer className="footer">
      <Container>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1  gap-2 font-normal text-sm">
            <span className="text-muted-foreground">{currentYear} &copy;</span>
            {brand.href ? (
              <a
                href={brand.href}
                target="_blank"
                className="text-secondary-foreground hover:text-primary"
              >
                {brand.label}
              </a>
            ) : (
              // URL not configured yet — the name still shows, as text.
              <span className="text-secondary-foreground">{brand.label}</span>
            )}
          </div>
          <nav className="flex order-1 md:order-2 gap-4 font-normal text-sm text-muted-foreground">
            {links.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  className="hover:text-primary"
                >
                  {link.label}
                </a>
              ) : (
                // Configured with an empty href: shown, but not a dead link.
                <span key={link.label}>{link.label}</span>
              ),
            )}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
