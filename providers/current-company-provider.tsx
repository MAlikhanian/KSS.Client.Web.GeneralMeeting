'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useTenant } from '@/providers/tenant-provider';

export interface CompanyOption {
  id: string;
  name: string;
}

interface CurrentCompanyContextValue {
  companies: CompanyOption[];
  currentCompanyId: string | null;
  currentCompany: CompanyOption | null;
  setCurrentCompany: (id: string) => void;
  loading: boolean;
  /** True when the hostname decides the company and the user cannot change it. */
  tenantBound: boolean;
}

const CurrentCompanyContext = createContext<CurrentCompanyContextValue | null>(null);

const COOKIE_NAME = 'x-company-id';
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  // path=/ so it's sent to every BFF route; the Person service reads it as X-Company-Id.
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

export function CurrentCompanyProvider({ children }: { children: ReactNode }) {
  // When the host is bound to a company, the hostname decides and the user's
  // saved choice is ignored. See lib/tenants.ts — this is not a security
  // boundary; the Person service must enforce it.
  const boundCompanyId = useTenant().companyId;

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/company-context/my-companies', { cache: 'no-store' });
        const list: CompanyOption[] = res.ok ? await res.json() : [];
        if (!active) return;
        setCompanies(list);

        const saved =
          readCookie(COOKIE_NAME) ??
          (typeof localStorage !== 'undefined' ? localStorage.getItem(COOKIE_NAME) : null);

        // Bound host: take the tenant's company even when the user is not a
        // member of it. Falling back to a company they DO belong to would
        // serve one tenant's data under another tenant's hostname, so this
        // fails closed — the request goes out scoped to the host's company
        // and the backend refuses it.
        const chosen = boundCompanyId
          ? boundCompanyId
          : saved && list.some((c) => c.id === saved)
            ? saved
            : list[0]?.id ?? null;

        setCurrentCompanyId(chosen);
        if (chosen) {
          writeCookie(COOKIE_NAME, chosen);
          try {
            localStorage.setItem(COOKIE_NAME, chosen);
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (active) setCompanies([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [boundCompanyId]);

  const setCurrentCompany = useCallback(
    (id: string) => {
      // A bound host owns the selection; ignore any attempt to switch.
      if (boundCompanyId) return;
      if (id === currentCompanyId) return;
      writeCookie(COOKIE_NAME, id);
      try {
        localStorage.setItem(COOKIE_NAME, id);
      } catch {
        /* ignore */
      }
      setCurrentCompanyId(id);
      // Reload so server components + BFF calls pick up the new cookie.
      window.location.reload();
    },
    [currentCompanyId, boundCompanyId],
  );

  const currentCompany = companies.find((c) => c.id === currentCompanyId) ?? null;

  return (
    <CurrentCompanyContext.Provider
      value={{
        companies,
        currentCompanyId,
        currentCompany,
        setCurrentCompany,
        loading,
        tenantBound: Boolean(boundCompanyId),
      }}
    >
      {children}
    </CurrentCompanyContext.Provider>
  );
}

export function useCurrentCompany(): CurrentCompanyContextValue {
  const ctx = useContext(CurrentCompanyContext);
  if (!ctx) {
    throw new Error('useCurrentCompany must be used within a CurrentCompanyProvider');
  }
  return ctx;
}
