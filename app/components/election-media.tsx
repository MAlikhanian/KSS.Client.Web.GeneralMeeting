'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

// Document-type ids (stable): person profile photo = 8, company logo/picture = 10.
const PERSON_PHOTO_TYPE = 8;
const COMPANY_LOGO_TYPE = 10;

function docInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

/**
 * Resolve the file URL of a document of a given type for an entity, by listing
 * its documents and matching the type id. The returned URL is served inline for
 * images, so it can be used directly as <img src>. Session auth travels via the
 * same-origin cookie the <img> request carries.
 */
function useDocImage(
  listUrl: string | null,
  typeField: 'documentTypeId' | 'companyDocumentTypeId',
  typeId: number,
  buildFileUrl: (docId: string) => string,
): string | null {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!listUrl) {
      setSrc(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(listUrl);
        if (!res.ok) return;
        const docs = await res.json();
        const doc = Array.isArray(docs)
          ? docs.find((d: Record<string, unknown>) => d[typeField] === typeId)
          : null;
        if (active) setSrc(doc ? buildFileUrl(String((doc as { id: string }).id)) : null);
      } catch {
        if (active) setSrc(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [listUrl, typeField, typeId]);
  return src;
}

export function PersonPhoto({
  personId,
  name,
  className = 'size-14 rounded-full object-cover shrink-0',
}: {
  personId: string;
  name: string;
  className?: string;
}) {
  const src = useDocImage(
    personId ? `/api/person/document?personId=${personId}` : null,
    'documentTypeId',
    PERSON_PHOTO_TYPE,
    (id) => `/api/person/document/${id}/file?personId=${personId}`,
  );
  if (src) return <img src={src} alt={name} className={className} />;
  return (
    <div className={`flex items-center justify-center bg-primary/10 text-primary font-semibold ${className}`}>
      {docInitials(name)}
    </div>
  );
}

export function CompanyLogo({
  companyId,
  name,
  className = 'size-7 rounded object-contain shrink-0',
}: {
  companyId?: string | null;
  name?: string;
  className?: string;
}) {
  const src = useDocImage(
    companyId ? `/api/company/document?companyId=${companyId}` : null,
    'companyDocumentTypeId',
    COMPANY_LOGO_TYPE,
    (id) => `/api/company/document/${id}/file?companyId=${companyId}`,
  );
  if (src) return <img src={src} alt={name ?? ''} className={className} />;
  return <Building2 className={`text-muted-foreground ${className}`} />;
}
