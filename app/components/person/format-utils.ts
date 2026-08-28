const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
const englishDigits = '0123456789';

/**
 * Convert Persian (۰-۹) and Arabic-Indic (٠-٩) digits in a string to ASCII 0-9.
 * Use on user input before validating/storing a numeric field (e.g. National ID),
 * so the backend only ever receives English digits.
 */
export function toEnglishDigits(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => englishDigits[persianDigits.indexOf(d)])
    .replace(/[٠-٩]/g, (d) => englishDigits[arabicDigits.indexOf(d)]);
}

/**
 * Convert digits in a string to match the current locale.
 * fa-IR: 0123456789 → ۰۱۲۳۴۵۶۷۸۹
 * en-US: keeps as-is
 */
export function localizeDigits(str: string | null | undefined, locale: string): string {
  if (!str) return '-';
  if (locale === 'fa-IR') {
    return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
  }
  // en: convert Persian digits to English (in case data has mixed)
  return str.replace(/[۰-۹]/g, (d) => englishDigits[persianDigits.indexOf(d)]);
}

/**
 * Map raw backend error messages to i18n error codes.
 * Backend can return either:
 * 1. Error CODE (e.g., "DUPLICATE_NATIONAL_ID") → looked up in i18n directly
 * 2. Raw SQL/EF error text → mapped to a code, then looked up in i18n
 *
 * Usage: translateApiError(error.message, t)
 * where t is the i18n translate function.
 */
export function translateApiError(
  message: string,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  // 1. If message is already an error code (from BusinessRuleException), translate directly.
  // Keys live in the `api-errors` i18n namespace — must be addressed explicitly,
  // since callers typically pass a `t` scoped to a feature namespace.
  const directTranslation = t(message, { ns: 'api-errors', defaultValue: '' });
  if (directTranslation) return directTranslation;

  // 2. Map raw error text to error codes
  let code = 'UNKNOWN_ERROR';

  if (message.includes('UNIQUE KEY') || message.includes('duplicate key') || message.includes('Cannot insert duplicate')) {
    if (message.includes('NationalId')) code = 'DUPLICATE_NATIONAL_ID';
    else if (message.includes('Email')) code = 'DUPLICATE_EMAIL';
    else if (message.includes('Phone')) code = 'DUPLICATE_PHONE';
    else code = 'DUPLICATE_RECORD';
  } else if (message.includes('FOREIGN KEY') || message.includes('conflicted with the')) {
    code = 'FOREIGN_KEY_VIOLATION';
  } else if (message.includes('not found') || message.includes('404')) {
    code = 'RECORD_NOT_FOUND';
  } else if (message.includes('concurrency') || message.includes('modified or deleted')) {
    code = 'CONCURRENCY_ERROR';
  } else if (message.includes('timeout') || message.includes('Timeout')) {
    code = 'TIMEOUT_ERROR';
  } else if (message.includes('connection') || message.includes('ECONNREFUSED')) {
    code = 'CONNECTION_ERROR';
  } else if (message.includes('500') || message.includes('Internal Server Error')) {
    code = 'SERVER_ERROR';
  } else {
    // Not a known pattern — return original message (might be clean BusinessRuleException text)
    return message;
  }

  return t(code, { ns: 'api-errors', defaultValue: message });
}

/**
 * Format a UTC datetime string to local date+time.
 * Backend sends UTC with 'Z' suffix (via UtcDateTimeConverter).
 * JavaScript automatically converts to browser's local timezone.
 */
export function formatDateTime(dateStr: string | null | undefined, locale: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
