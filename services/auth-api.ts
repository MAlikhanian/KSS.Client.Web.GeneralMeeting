/**
 * KSS Auth Service (KSS.Service.Auth)
 *
 * Server-side only functions for register and login.
 * Base URL from AUTH_API_BASE_URL env only (set in .env / ConfigMap / k8s).
 */

function getBaseUrl(): string {
  const baseUrl = process.env.AUTH_API_BASE_URL;
  if (!baseUrl) {
    console.error('[Auth API] AUTH_API_BASE_URL is not set in environment variables');
    throw new Error(
      'AUTH_API_BASE_URL environment variable is required but not set.',
    );
  }
  console.log('[Auth API] Using base URL:', baseUrl);
  return baseUrl;
}

/**
 * Error thrown for non-OK Auth API responses. Carries the upstream HTTP status
 * so the BFF can relay it without regex-matching on message text.
 */
export class AuthApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

/**
 * Register a new user
 * POST /Api/User/Register
 */
export async function registerAuth(
  data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    countryId?: number;
  },
  captchaPayload: string,
): Promise<any> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/User/Register`;

  console.log('[Auth API] Registering user:', { url, username: data.username, email: data.email });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Captcha-Payload': captchaPayload,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('[Auth API] Registration failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url
      });

      let message = 'Registration failed. Please try again later.';
      try {
        const errorJson = JSON.parse(errorText);
        message = errorJson.message || message;
      } catch {
        message = errorText || message;
      }
      throw new AuthApiError(message, response.status);
    }

    const text = await response.text();
    if (!text || !text.trim()) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  } catch (error) {
    console.error('[Auth API] Registration error:', { 
      error: error instanceof Error ? error.message : String(error),
      url,
      baseUrl 
    });
    throw error;
  }
}

/**
 * Login
 * POST /Api/User/Login
 * Returns { token, refreshToken, tokenExpires, user }
 */
export async function loginAuth(
  data: {
    username: string;
    password: string;
  },
  captchaPayload: string,
): Promise<{
  token: string;
  refreshToken: string;
  tokenExpires: string;
  roles: string[];
  permissions: string[];
  user: {
    id: string;
    personId: string | null;
    username: string;
    email: string;
    phone: string | null;
    isActive: boolean;
  };
}> {
  const response = await fetch(`${getBaseUrl()}/Api/User/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Captcha-Payload': captchaPayload,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    let message = 'Invalid username or password.';
    try {
      const errorJson = JSON.parse(errorText);
      message = errorJson.message || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Get current user info
 * GET /Api/User/GetCurrentUser
 * Requires authentication token
 */
export async function getCurrentUser(token: string): Promise<{
  id: string;
  personId: string | null;
  username: string;
  email: string;
  phone: string | null;
  isActive: boolean;
}> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/Api/User/GetCurrentUser`;
  
  if (!token) {
    throw new Error('Authentication token is required');
  }
  
  console.log('[Auth API] Fetching current user:', { url });
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('[Auth API] Fetch failed:', { 
        status: response.status, 
        statusText: response.statusText,
        errorText,
        url 
      });
      
      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        throw new Error('Authentication token expired. Please log in again.');
      }
      
      let message = 'Failed to fetch current user. Please try again later.';
      try {
        const errorJson = JSON.parse(errorText);
        message = errorJson.message || message;
      } catch {
        message = errorText || message;
      }
      throw new Error(message);
    }

    return response.json();
  } catch (error) {
    console.error('[Auth API] Fetch error:', {
      error: error instanceof Error ? error.message : String(error),
      url,
      baseUrl
    });
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Security management helpers (powers /person/security page)
// All take a Bearer token and call the C# /Api/User endpoints.
// ─────────────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: string;
  personId: string | null;
  username: string;
  email: string;
  phone: string | null;
  countryId: number | null;
  passwordHash: string;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  isPhoneVerified: boolean;
  phoneVerifiedAt: string | null;
  lastLoginAt: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: string | null;
  refreshToken: string | null;
  refreshTokenExpires: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  deletedBy: string | null;
  deletedAt: string | null;
  isActive: boolean;
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function readError(response: Response, fallback: string): Promise<string> {
  const text = await response.text().catch(() => response.statusText);
  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text);
    return parsed.message || fallback;
  } catch {
    return text || fallback;
  }
}

/**
 * GET /Api/User/ByPersonId/{personId}
 * Returns null if the backend returns 404 (no user account linked).
 */
export async function getUserByPersonId(
  token: string,
  personId: string,
): Promise<UserDto | null> {
  const url = `${getBaseUrl()}/Api/User/ByPersonId/${personId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to fetch user.'));
  }
  return response.json();
}

/**
 * POST /Api/User/MapPersonsToUsers — bulk lookup. For each input PersonId
 * that has a User account, returns the corresponding UserId. Used by the
 * dashboard frontend to filter access grants down to "users with logins".
 */
export async function mapPersonsToUsers(
  token: string,
  personIds: string[],
): Promise<Record<string, string>> {
  const url = `${getBaseUrl()}/Api/User/MapPersonsToUsers`;
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ personIds }),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to map persons to users.'));
  }
  return response.json();
}

/** PUT /Api/User/ChangePassword — self-service. */
export async function changePassword(
  token: string,
  data: { currentPassword: string; newPassword: string },
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Api/User/ChangePassword`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to change password.'));
  }
}

/** PUT /Api/User/AdminResetPassword — admin override, no current password. */
export async function adminResetPassword(
  token: string,
  data: { userId: string; newPassword: string },
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Api/User/AdminResetPassword`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to reset password.'));
  }
}

/** POST /Api/User/Lock/{userId} — body { lockMinutes }. */
export async function lockUser(
  token: string,
  userId: string,
  lockMinutes: number,
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Api/User/Lock/${userId}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ lockMinutes }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to lock user.'));
  }
}

/** POST /Api/User/Unlock/{userId}. */
export async function unlockUser(token: string, userId: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Api/User/Unlock/${userId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to unlock user.'));
  }
}

/** POST /Api/User/MarkEmailVerified/{userId}. */
export async function markEmailVerified(
  token: string,
  userId: string,
): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/Api/User/MarkEmailVerified/${userId}`,
    { method: 'POST', headers: authHeaders(token) },
  );
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to mark email verified.'));
  }
}

/** POST /Api/User/MarkPhoneVerified/{userId}. */
export async function markPhoneVerified(
  token: string,
  userId: string,
): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/Api/User/MarkPhoneVerified/${userId}`,
    { method: 'POST', headers: authHeaders(token) },
  );
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to mark phone verified.'));
  }
}

/** PUT /Api/User/SetActive/{userId} — body { isActive }. */
export async function setUserActive(
  token: string,
  userId: string,
  isActive: boolean,
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Api/User/SetActive/${userId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to update status.'));
  }
}

/** POST /Api/User/RevokeSessions/{userId}. */
export async function revokeUserSessions(
  token: string,
  userId: string,
): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/Api/User/RevokeSessions/${userId}`,
    { method: 'POST', headers: authHeaders(token) },
  );
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to revoke sessions.'));
  }
}

/** GET /Api/User/UserRoles/{userId} — list of role names. */
export async function getUserRoles(
  token: string,
  userId: string,
): Promise<string[]> {
  const response = await fetch(`${getBaseUrl()}/Api/User/UserRoles/${userId}`, {
    method: 'GET',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load roles.'));
  }
  return response.json();
}

/** PUT /Api/User/AssignRoles — body { userId, roleIds }. */
export async function assignUserRoles(
  token: string,
  data: { userId: string; roleIds: string[] },
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Api/User/AssignRoles`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to assign roles.'));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission & Role administration helpers (powers /admin RBAC page).
// All take a Bearer token and call the C# /Api/Permission and /Api/Role
// endpoints. Used by the Next.js proxy routes under /api/auth/permission
// and /api/auth/role.
// ─────────────────────────────────────────────────────────────────────────────

export interface PermissionTranslation {
  permissionId: string;
  languageId: number;
  name: string;
  description?: string | null;
}

export interface Permission {
  id: string;
  /** Machine-readable claim name, e.g. "Person.Information.Read" */
  code: string;
  /** FK to Common-service Module (Guid). */
  moduleId: string;
  /** FK to Common-service Resource (Guid). */
  resourceId: string;
  /** Localized name + description rows for the user's language(s). */
  translations: PermissionTranslation[];
}

export interface RoleTranslation {
  roleId: string;
  languageId: number;
  name: string;
  description?: string | null;
}

export interface Role {
  id: string;
  /** Machine-readable role code, e.g. "SuperAdmin", "PersonAdmin". */
  code: string;
  /** FK to Common-service Module (Guid). null = global role. */
  moduleId?: string | null;
  /** Localized name + description rows for the user's language(s). */
  translations: RoleTranslation[];
  /** Array of permission Codes, as returned by GetAll. */
  permissions: string[];
}

/** GET /Api/Permission/ToListAll → Permission[] */
export async function listPermissions(token: string): Promise<Permission[]> {
  const response = await fetch(`${getBaseUrl()}/Api/Permission/ToListAll`, {
    method: 'GET',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load permissions.'));
  }
  return response.json();
}

// Permission catalog is read-only — maintained via DB migrations only.
// No createPermission/updatePermission/deletePermission helpers.

/** GET /Api/Role/GetAll → Role[] (each role has permissions: string[] of names). */
export async function listRoles(token: string): Promise<Role[]> {
  const response = await fetch(`${getBaseUrl()}/Api/Role/GetAll`, {
    method: 'GET',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Failed to load roles.'));
  }
  return response.json();
}

// Role catalog is read-only — maintained via DB migrations only.
// No createRole/updateRole/deleteRole/assignPermissionsToRole helpers.
