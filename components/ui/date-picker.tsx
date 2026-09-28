'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import DateObject from 'react-date-object';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value?: string | Date;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  forcePersian?: boolean;
}

export const DatePickerComponent = forwardRef<HTMLDivElement, DatePickerProps>(
  ({
    value,
    onChange,
    placeholder,
    label,
    required = false,
    disabled = false,
    className,
    error,
    minDate,
    maxDate,
    forcePersian = false,
    ...props
  }, ref) => {
  const [mounted, setMounted] = useState(false);
  const [inModal, setInModal] = useState(false);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const { i18n } = useTranslation();

    // Merge the forwarded ref with an internal ref so we can inspect the DOM
    // to detect whether this picker is rendered inside a modal dialog.
    const setRefs = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    useEffect(() => {
      setMounted(true);
      // Radix Dialog/AlertDialog content carries role="dialog"/"alertdialog".
      // Inside a modal, Radix sets `pointer-events: none` on <body>, which makes
      // a portaled calendar (mounted under <body>) unclickable. Detect that and
      // render the calendar inline (no portal) so it stays interactive and above
      // the overlay. On normal pages the portal is kept (prevents clipping).
      if (innerRef.current?.closest('[role="dialog"], [role="alertdialog"]')) {
        setInModal(true);
      }
    }, []);

    // Determine calendar and locale based on language or forcePersian prop
    const isPersian = forcePersian || i18n.language === 'fa' || i18n.language === 'persian';
    const calendar = isPersian ? persian : gregorian;
    const locale = isPersian ? persian_fa : gregorian_en;
    const defaultPlaceholder = isPersian ? 'تاریخ را انتخاب کنید' : 'Select date';
    const dateFormat = isPersian ? 'YYYY/MM/DD' : 'YYYY-MM-DD';

    if (!mounted) {
      return (
        <div ref={setRefs} className={cn('space-y-2', className)}>
          {label && (
            <Label>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          <div className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 text-[0.8125rem] leading-(--text-sm--line-height) shadow-xs shadow-black/5 transition-[color,box-shadow] text-foreground placeholder:text-muted-foreground/80 focus-visible:ring-ring/30 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-60">
            <span className="text-muted-foreground/80">{placeholder || defaultPlaceholder}</span>
          </div>
        </div>
      );
    }

    return (
      <div ref={setRefs} className={cn('space-y-2', className)}>
        {label && (
          <Label>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
                <DatePicker
                  key={`${i18n.language}-${resolvedTheme}`}
                  value={value ? new DateObject(value) : undefined}
                  onChange={(date: DateObject | DateObject[] | string | null) => {
                    if (onChange && date) {
                      if (date instanceof DateObject) {
                        // Convert to Gregorian calendar then format as YYYY-MM-DD
                        // Note: Do NOT use .toDate().toISOString() — that converts to UTC
                        // which shifts the date back by one day in positive UTC offsets (e.g. Iran +3:30)
                        const gDate = date.convert(gregorian);
                        const y = gDate.year;
                        const m = String(gDate.month.number).padStart(2, '0');
                        const d = String(gDate.day).padStart(2, '0');
                        onChange(`${y}-${m}-${d}`);
                      } else if (Array.isArray(date) && date.length > 0) {
                        const firstDate = date[0];
                        if (firstDate && typeof firstDate === 'object' && 'convert' in firstDate) {
                          const gDate = (firstDate as DateObject).convert(gregorian);
                          const y = gDate.year;
                          const m = String(gDate.month.number).padStart(2, '0');
                          const d = String(gDate.day).padStart(2, '0');
                          onChange(`${y}-${m}-${d}`);
                        }
                      } else {
                        onChange(date as string);
                      }
                    }
                  }}
                  calendar={calendar}
                  locale={locale}
                  format={dateFormat}
                  {...(inModal ? {} : { portal: true })}
                  minDate={minDate}
                  maxDate={maxDate}
                  disabled={disabled}
                  inputClass={cn(
                    // Use exact same classes as template Input component
                    'flex w-full bg-background border border-input shadow-xs shadow-black/5 transition-[color,box-shadow] text-foreground placeholder:text-muted-foreground/80',
                    'focus-visible:ring-ring/30 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px]',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    'h-8.5 ps-3 pe-9 text-[0.8125rem] leading-(--text-sm--line-height) rounded-md',
                    'file:h-full file:py-0 file:border-solid file:border-input file:bg-transparent file:font-medium file:not-italic file:text-foreground file:p-0 file:border-0 file:border-e file:pe-3 file:me-3',
                    'aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20',
                    error && 'border-destructive/60 ring-destructive/10 dark:border-destructive dark:ring-destructive/20'
                  )}
                  containerClassName="w-full"
                  style={{
                    '--rmdp-background-color': resolvedTheme === 'dark' ? '#000000' : '#ffffff',
                  } as React.CSSProperties}
          {...props}
        />
          <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

DatePickerComponent.displayName = 'DatePickerComponent';