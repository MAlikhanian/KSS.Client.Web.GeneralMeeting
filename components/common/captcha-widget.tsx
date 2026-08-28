'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

// `altcha` registers a custom element (`customElements.define`) at import time,
// which only works in the browser. Importing it eagerly from a 'use client'
// component still runs the import during SSR and triggers a hydration mismatch
// because the server-rendered <altcha-widget> element has no shadow DOM yet
// while the client one does. Loading altcha + rendering the element only after
// mount keeps SSR and first client render identical (a placeholder div).

// JSX intrinsic-element type augmentation for the <altcha-widget> vendor custom
// element. React 19's recommended pattern uses `namespace JSX { ... }` inside
// a `declare module 'react'` block — the `no-namespace` lint rule is disabled
// for this single declaration because there is no alternative syntax that
// works for module-augmenting React's JSX namespace at the time of writing.
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          // altcha v3's observed attribute for the challenge URL is `challenge`
          // (single word). It used to be `challengeurl` in older docs/examples;
          // setting `challengeurl` on a v3 widget is silently ignored and the
          // widget logs "Verification failed" because config.challenge is empty.
          challenge?: string;
          auto?: 'off' | 'onfocus' | 'onload' | 'onsubmit';
          name?: string;
          configuration?: string;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface CaptchaWidgetProps {
  onVerified: (payload: string) => void;
  onExpired?: () => void;
  /**
   * Text shown by the browser as the native form-validation tooltip on
   * altcha's hidden `<input required>` when the user tries to submit before
   * solving the captcha. Caller should pass a translated string via the
   * project's i18n (`t('signin.errors.captchaCheckBox')` etc.) so the message
   * follows the active language.
   */
  validationMessage?: string;
  className?: string;
}

export function CaptchaWidget({
  onVerified,
  onExpired,
  validationMessage,
  className,
}: CaptchaWidgetProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Map our i18n locale to altcha's bundled language codes. Altcha ships
  // translations like fa.js, en.js etc. as side-effect modules that register
  // themselves on globalThis.$altcha.i18n.
  const language = (i18n.language || 'en').toLowerCase().startsWith('fa')
    ? 'fa'
    : 'en';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // @ts-expect-error — altcha's .cjs entry has types but moduleResolution can't see them dynamically
      await import('altcha');
      // @ts-expect-error — altcha i18n subpath types not resolved at this granularity
      await import('altcha/i18n/fa');
      // @ts-expect-error — altcha i18n subpath types not resolved at this granularity
      await import('altcha/i18n/en');
      if (cancelled) return;

      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
      setMounted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = ref.current;
    if (!el) return;

    const handleVerified = (e: Event) => {
      const detail = (e as CustomEvent<{ payload: string }>).detail;
      if (detail?.payload) onVerified(detail.payload);
    };
    const handleExpired = () => {
      onExpired?.();
    };

    el.addEventListener('verified', handleVerified);
    el.addEventListener('expired', handleExpired);
    return () => {
      el.removeEventListener('verified', handleVerified);
      el.removeEventListener('expired', handleExpired);
    };
  }, [mounted, onVerified, onExpired]);

  // altcha-widget defaults to `display: inline; width: auto` which makes it
  // (a) stick to the start of the row (the right side in RTL) and (b) ignore
  // any flex parent's stretching. Forcing block + 100% width makes the widget
  // span the full form column, and the wrapper adds breathing room above and
  // below so it doesn't collide with the submit button.
  const wrapperClass = `my-4 ${className ?? ''}`.trim();
  const widgetStyle = { display: 'block', width: '100%' } as React.CSSProperties;

  // Browser's native form-validation tooltip on altcha's hidden `<input required>`.
  // Altcha's i18n covers the in-widget labels and the VERIFYING-state waitAlert,
  // but the unverified validationMessage has no built-in i18n hookup — the caller
  // passes the translated string via the project's react-i18next.
  const altchaConfig = validationMessage
    ? JSON.stringify({ validationMessage })
    : undefined;

  if (!mounted) {
    return <div className={wrapperClass} style={{ minHeight: '78px' }} />;
  }

  return (
    <div className={wrapperClass}>
      {/*
        Theming: map altcha's CSS vars to the project's design tokens defined
        in `css/config.reui.css`. No hardcoded colors / fonts — the widget
        follows whatever the project theme uses (light/dark, future changes).
        Width fix: altcha hardcodes `.altcha-main { max-width: 320px }`; we
        stretch it to fill the column so it matches input / button widths.
      */}
      <style>{`
        altcha-widget {
          --altcha-color-base: var(--background);
          --altcha-color-base-content: var(--foreground);
          --altcha-color-primary: var(--primary);
          --altcha-color-primary-content: var(--primary-foreground);
          --altcha-color-neutral: var(--muted-foreground);
          --altcha-color-neutral-content: var(--muted);
          --altcha-border-color: var(--border);
          --altcha-border-radius: var(--radius);
        }
        altcha-widget,
        altcha-widget * {
          font-family: inherit;
        }
        altcha-widget .altcha,
        altcha-widget .altcha-main {
          max-width: 100% !important;
          width: 100% !important;
        }
      `}</style>
      <altcha-widget
        ref={ref as React.RefObject<HTMLElement>}
        challenge="/api/captcha/challenge"
        auto="onload"
        theme={theme}
        language={language}
        configuration={altchaConfig}
        style={widgetStyle}
      />
    </div>
  );
}
