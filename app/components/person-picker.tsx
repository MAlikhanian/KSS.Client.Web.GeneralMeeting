'use client';

import { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export interface PersonRecord {
  id: string;
  nationalId?: string | null;
  translations?: { languageId: number; firstName: string; lastName: string }[];
}

export function personDisplayName(p: PersonRecord, langId: number): string {
  const tr = p.translations?.find((x) => x.languageId === langId) || p.translations?.[0];
  return tr ? `${tr.firstName} ${tr.lastName}`.trim() : p.nationalId || p.id;
}

interface PersonPickerProps {
  persons: PersonRecord[];
  value: string | null;
  onChange: (personId: string | null) => void;
  langId: number;
  placeholder?: string;
  disabled?: boolean;
}

/** Searchable person combobox for nominating board-election candidates. */
export function PersonPicker({
  persons,
  value,
  onChange,
  langId,
  placeholder,
  disabled,
}: PersonPickerProps) {
  const { t } = useTranslation('general-meeting');
  const [open, setOpen] = useState(false);

  const selected = value ? persons.find((p) => p.id === value) ?? null : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selected
              ? personDisplayName(selected, langId)
              : placeholder ?? t('candidatePickerPlaceholder', { defaultValue: 'Search and select a person' })}
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
              {persons.map((p) => {
                const name = personDisplayName(p, langId);
                return (
                  <CommandItem
                    key={p.id}
                    value={`${name} ${p.nationalId ?? ''}`.trim()}
                    onSelect={() => {
                      onChange(p.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn('me-2 h-4 w-4', value === p.id ? 'opacity-100' : 'opacity-0')} />
                    <span className="flex-1">{name}</span>
                    {p.nationalId && (
                      <span className="text-xs text-muted-foreground font-mono">{p.nationalId}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
