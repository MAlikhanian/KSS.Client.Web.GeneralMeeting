'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useBrokerages } from '@/hooks/use-brokerages';
import { useInvestmentFunds } from '@/hooks/use-investment-funds';

export const BROKERAGE = 1;
export const FUND = 2;

export interface MemberOption {
  companyId: string;
  memberType: number;
  name: string;
}

/** Merged member directory (brokerages + investment funds), keyed by CompanyId. */
export function useMembers(): MemberOption[] {
  const { brokerages } = useBrokerages();
  const { investmentFunds } = useInvestmentFunds();
  return useMemo(
    () => [
      ...brokerages.map((b) => ({ companyId: b.id, memberType: BROKERAGE, name: b.name })),
      ...investmentFunds.map((f) => ({ companyId: f.id, memberType: FUND, name: f.name })),
    ],
    [brokerages, investmentFunds],
  );
}

interface MemberPickerProps {
  value: string | null;
  onChange: (companyId: string | null, memberType: number | null) => void;
  disabled?: boolean;
}

/** Searchable brokerage/fund picker for choosing the company a candidate represents. */
export function MemberPicker({ value, onChange, disabled }: MemberPickerProps) {
  const { t } = useTranslation('general-meeting');
  const members = useMembers();
  const [open, setOpen] = useState(false);
  const selected = value ? members.find((m) => m.companyId === value) ?? null : null;

  const typeLabel = (mt: number) =>
    mt === BROKERAGE
      ? t('brokerage', { defaultValue: 'Brokerage' })
      : t('fund', { defaultValue: 'Fund' });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" disabled={disabled} className="w-full justify-between">
          <span className="truncate">
            {selected
              ? selected.name
              : t('memberPickerPlaceholder', { defaultValue: 'Select a member company' })}
          </span>
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('search', { defaultValue: 'Search' })} />
          <CommandList>
            <CommandEmpty>{t('noResults', { defaultValue: 'No results found' })}</CommandEmpty>
            <CommandGroup>
              {members.map((m) => (
                <CommandItem
                  key={m.companyId}
                  value={`${m.name} ${typeLabel(m.memberType)}`}
                  onSelect={() => {
                    onChange(m.companyId, m.memberType);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('me-2 h-4 w-4', value === m.companyId ? 'opacity-100' : 'opacity-0')} />
                  <span className="flex-1" style={{ unicodeBidi: 'plaintext' }}>
                    {m.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {typeLabel(m.memberType)}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
