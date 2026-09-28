/**
 * Maps error messages from API/auth services to translation keys.
 *
 * Backends increasingly return short SCREAMING_SNAKE error codes (e.g.
 * `DUPLICATE_USERNAME`) instead of English prose, so we first try to look the
 * raw message up in the `api-errors` i18n namespace. The legacy prose matchers
 * stay underneath as a back-compat fallback.
 */
export function translateAuthError(
  errorMessage: string,
  t: (key: string, options?: Record<string, unknown>) => string,
  type: 'signin' | 'signup' = 'signin'
): string {
  // 1. Try `api-errors` namespace — covers backend codes like DUPLICATE_*.
  const direct = t(errorMessage, { ns: 'api-errors', defaultValue: '' });
  if (direct) return direct;

  const message = errorMessage.toLowerCase().trim();

  // Signin errors
  if (type === 'signin') {
    if (
      message.includes('invalid') &&
      (message.includes('username') ||
        message.includes('password') ||
        message.includes('national code') ||
        message.includes('nationalcode') ||
        message.includes('credentials'))
    ) {
      return t('signin.errors.invalidCredentials');
    }

    if (
      message.includes('please enter') &&
      (message.includes('username') ||
        message.includes('password') ||
        message.includes('national code') ||
        message.includes('nationalcode'))
    ) {
      return t('signin.errors.missingCredentials');
    }

    if (message.includes('locked')) {
      return t('signin.errors.accountLocked');
    }

    if (message.includes('inactive')) {
      return t('signin.errors.accountInactive');
    }

    if (message.includes('authentication failed')) {
      return t('signin.errors.authenticationFailed');
    }

    if (message.includes('network') || message.includes('connection')) {
      return t('signin.errors.networkError');
    }

    if (message.includes('captcha')) {
      if (message.includes('required')) {
        return t('signin.errors.captchaRequired');
      }
      return t('signin.errors.captchaInvalid');
    }
  }

  // Signup errors
  if (type === 'signup') {
    if (
      message.includes('email') &&
      (message.includes('already') || message.includes('exists') || message.includes('registered'))
    ) {
      return t('signup.errors.emailExists');
    }

    if (
      (message.includes('username') ||
        message.includes('national code') ||
        message.includes('nationalcode')) &&
      (message.includes('already') || message.includes('exists'))
    ) {
      return t('signup.errors.usernameExists');
    }

    if (
      message.includes('phone') &&
      (message.includes('already') || message.includes('exists'))
    ) {
      return t('signup.errors.phoneExists');
    }

    if (
      message.includes('already exists') ||
      message.includes('already registered')
    ) {
      return t('signup.errors.alreadyExists');
    }

    if (message.includes('captcha')) {
      if (message.includes('required')) {
        return t('signup.errors.captchaRequired');
      }
      return t('signup.errors.captchaInvalid');
    }

    if (
      message.includes('invalid input') ||
      message.includes('validation') ||
      message.includes('check your data')
    ) {
      return t('signup.errors.validationFailed');
    }

    if (
      message.includes('registration failed') ||
      message.includes('try again later')
    ) {
      return t('signup.errors.registrationFailed');
    }
  }

  // Generic fallback
  return t(`${type}.errors.generic`);
}
