'use client';

import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import { useCurrentCompany } from '@/providers/current-company-provider';

/**
 * Sticky company selector. Shows the company the user is acting as and lets them
 * switch between the companies they belong to. Hidden when there is nothing to
 * switch (0 or 1 company) — the single company is auto-selected by the provider.
 */
export function CompanyPicker({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { companies, currentCompanyId, setCurrentCompany, loading } = useCurrentCompany();

  if (loading || companies.length <= 1) return null;

  return (
    <Select value={currentCompanyId ?? undefined} onValueChange={setCurrentCompany}>
      <SelectTrigger className={`h-9 gap-2 min-w-[180px] ${className ?? ''}`}>
        <Building2 className="size-4 text-muted-foreground shrink-0" />
        <SelectValue placeholder={t('selectCompany', { defaultValue: 'Select company' })} />
      </SelectTrigger>
      <SelectContent>
        {companies.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
