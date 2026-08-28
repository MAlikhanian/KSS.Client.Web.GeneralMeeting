'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

/** Group an integer digit string with thousands commas: "1000000" -> "1,000,000". */
function formatWithCommas(raw: string): string {
  if (!raw) return '';
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export type AmountInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'type' | 'ref'
> & {
  /** Raw digit string, e.g. "1000000" (no separators). */
  value: string;
  /** Receives the raw digit string with any separators/non-digits stripped. */
  onChange: (raw: string) => void;
};

/**
 * Amount input that shows the value grouped with commas as the user types,
 * while emitting the RAW digit string via onChange (so callers keep parsing it
 * the same way). Integer-only — Rial amounts have no decimals.
 */
const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, ...props }, ref) => (
    <Input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      dir={value ? 'ltr' : undefined}
      value={formatWithCommas(value ?? '')}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
    />
  ),
);
AmountInput.displayName = 'AmountInput';

export { AmountInput };
