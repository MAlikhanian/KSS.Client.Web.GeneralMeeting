'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export interface PersonSearchResult {
  id: string;
  nationalId: string;
  translations: Array<{
    languageId: number;
    firstName: string;
    lastName: string;
  }>;
}

interface PersonSearchProps {
  onSelect: (person: PersonSearchResult | null) => void;
  required?: boolean;
  label?: string;
  /** Optional controlled value — when provided, the component reflects it
   *  and treats it as the current selection. Useful for restoring a remembered
   *  filter from localStorage. */
  value?: PersonSearchResult | null;
  /** Optional override for the list endpoint. Defaults to `/api/person`
   *  (access-filtered). Pass `/api/person/directory` to search every person on
   *  the system — used by the access-grant dialog so the picker isn't limited
   *  to people the caller already has access to. */
  apiUrl?: string;
}

const LANG_CODE_TO_ID: Record<string, number> = { fa: 12, en: 10 };
// Server-side typeahead: only query once the user has typed this many chars.
const MIN_SEARCH_CHARS = 3;
// No cap on the matches: once MIN_SEARCH_CHARS is reached, load ALL persons that
// match the query. The BFF requires a limit, so this high value acts as "no limit".
const SEARCH_LIMIT = 100000;

export function PersonSearch({ onSelect, required = false, label, value, apiUrl = '/api/person' }: PersonSearchProps) {
  const { t, i18n } = useTranslation('person-search');
  const uiLangId = LANG_CODE_TO_ID[i18n.language] ?? 12;
  const [open, setOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<PersonSearchResult | null>(value ?? null);
  const [search, setSearch] = useState('');
  const [persons, setPersons] = useState<PersonSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync internal state when an external `value` is provided (e.g., restored
  // from localStorage on mount).
  useEffect(() => {
    if (value !== undefined) setInternalSelected(value);
  }, [value]);

  const selectedPerson = internalSelected;

  const getPersonDisplayName = (person: PersonSearchResult) => {
    const tr = person.translations?.find((tt) => tt.languageId === uiLangId) || person.translations?.[0];
    return tr ? `${tr.firstName} ${tr.lastName}`.trim() : person.nationalId || person.id;
  };

  const getSearchValue = (person: PersonSearchResult) => {
    const name = getPersonDisplayName(person);
    return `${name} ${person.nationalId || ''}`.trim();
  };

  // Debounced server-side search — fires only once the query has at least
  // MIN_SEARCH_CHARS characters. No longer loads the whole person list on open.
  useEffect(() => {
    const q = search.trim();
    if (q.length < MIN_SEARCH_CHARS) {
      setPersons([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const sep = apiUrl.includes('?') ? '&' : '?';
        const res = await fetch(`${apiUrl}${sep}query=${encodeURIComponent(q)}&limit=${SEARCH_LIMIT}`);
        const data = res.ok ? await res.json() : null;
        setPersons(data?.data || []);
      } catch {
        setPersons([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [search, apiUrl]);

  const handleSelect = (person: PersonSearchResult) => {
    setInternalSelected(person);
    setOpen(false);
    onSelect(person);
  };

  const handleClear = () => {
    setInternalSelected(null);
    onSelect(null);
  };

  return (
    <div className="space-y-2">
      <Label>
        {label ?? t('label', { defaultValue: 'Person' })}
        {required && <span className="text-rose-500 ms-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <Popover
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            // Reset the search each time the picker closes so it reopens fresh.
            if (!o) {
              setSearch('');
              setPersons([]);
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedPerson
                ? `${getPersonDisplayName(selectedPerson)}${selectedPerson.nationalId ? ` (${selectedPerson.nationalId})` : ''}`
                : t('placeholder', { defaultValue: 'Name, family name or national code...' })}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          {/* Portal so the dropdown renders on the body, escaping the person
              pages' glass-tint/text-color overrides — the picker keeps its own
              clean popover styling instead of inheriting the page template. */}
          <PopoverPrimitive.Portal>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            {/* shouldFilter={false}: results come pre-filtered from the server. */}
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t('searchPlaceholder', { defaultValue: 'Search...' })}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty className="px-3 py-8 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="size-5 opacity-40" />
                    <span>
                      {search.trim().length < MIN_SEARCH_CHARS
                        ? t('minChars', { defaultValue: 'Type at least 3 characters to search' })
                        : loading
                          ? t('common:loading', { defaultValue: 'Loading...' })
                          : t('noResults', { defaultValue: 'No results found' })}
                    </span>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {persons.map((person) => (
                    <CommandItem
                      key={person.id}
                      value={getSearchValue(person)}
                      onSelect={() => handleSelect(person)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPerson?.id === person.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1">{getPersonDisplayName(person)}</span>
                      {person.nationalId && (
                        <span className="text-xs text-muted-foreground font-mono">{person.nationalId}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
              {persons.length > 0 && (
                <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  {t('resultsCount', { n: persons.length, defaultValue: '{{n}} results' })}
                </div>
              )}
            </Command>
          </PopoverContent>
          </PopoverPrimitive.Portal>
        </Popover>
        {selectedPerson && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
