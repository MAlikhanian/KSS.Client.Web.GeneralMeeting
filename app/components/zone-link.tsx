'use client';

import { AnchorHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { useZoneSlugs } from '@/providers/zones-provider';

/**
 * A link that may cross an APP boundary.
 *
 * next/link is for navigating WITHIN one Next app, and every zone is a separate
 * build. Using it to leave the current app fails in two distinct ways:
 *
 *  1. basePath doubling. next/link prepends this app's basePath to an internal
 *     href by design, so from inside /spm a menu entry of /mpf/report is
 *     requested as /spm/mpf/report -> 404.
 *
 *  2. ChunkLoadError. A client-side navigation fetches an RSC payload and asks
 *     the RUNNING webpack runtime for the chunks it names. The target app is a
 *     different build with different chunk names, so the running runtime has
 *     never heard of them and throws.
 *
 * A plain <a> avoids both: no basePath is applied (that is a Next feature, not
 * a browser one) and there is no payload or chunk loading — the browser simply
 * requests the URL, the Shell's middleware rewrites it, and the owning app
 * renders the whole page with its own runtime.
 *
 * The cost is a full page load when crossing domains. That is correct, not a
 * compromise: they are genuinely separate applications.
 */

/**
 * The zone's mount prefix, or '' when this app is the Shell.
 *
 * NOT simply NEXT_PUBLIC_BASE_PATH: the SHELL sets that variable to a full URL
 * (e.g. "http://localhost:3000/") because toAbsoluteUrl() uses it as an asset
 * base. Only a value that is a real path prefix ("/spm") is a Next basePath.
 * Treating the Shell's URL as a basePath would make every Shell link a full
 * page load and skip the zone-slug check entirely.
 */
const RAW = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const BASE = RAW.startsWith('/') && RAW !== '/' ? RAW.replace(/\/+$/, '') : '';

type ZoneLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export function ZoneLink({ href, children, ...rest }: ZoneLinkProps) {
  const zoneSlugs = useZoneSlugs();

  // Anything not rooted at "/" (http://, mailto:, #anchor) is not ours to route.
  const isInternal = href.startsWith('/');
  const segment = isInternal ? (href.split('/')[1] ?? '') : '';

  const crossesApp = !isInternal
    ? true
    : BASE
      ? // In a zone: our own basePath prefix is ours, everything else is foreign.
        !(href === BASE || href.startsWith(`${BASE}/`))
      : // In the Shell: only a segment currently served by a zone is foreign.
        segment !== '' && zoneSlugs.includes(segment);

  if (crossesApp) {
    return (
      <a
        href={href}
        {...rest}
        onClick={(e) => {
          rest.onClick?.(e);
          // The sidebar's AccordionMenuItem trigger calls preventDefault() on
          // EVERY click (components/ui/accordion-menu.tsx), which cancels a
          // plain anchor's default navigation and makes the menu item do
          // nothing. next/link was immune because it navigates programmatically
          // rather than relying on the default action; do the same here.
          //
          // Leave modified clicks alone so "open in new tab" still behaves.
          if (e.defaultPrevented) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
            return;
          }
          e.preventDefault();
          window.location.href = href;
        }}
      >
        {children}
      </a>
    );
  }

  // next/link takes a basePath-RELATIVE href and prepends basePath itself. The menu
  // config stores absolute paths that ALREADY include the zone prefix, so hand Link the
  // remainder — otherwise it renders /cash-advance/cash-advance/... . In the Shell
  // (BASE === '') this strip is a no-op and behaviour is unchanged.
  const sameAppHref = BASE && href.startsWith(BASE) ? href.slice(BASE.length) || '/' : href;

  return (
    <Link href={sameAppHref} {...rest}>
      {children}
    </Link>
  );
}
