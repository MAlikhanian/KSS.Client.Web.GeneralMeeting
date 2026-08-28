import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      status: string;
      personId?: string | null;
      /** Roles from Auth service (e.g. ['Admin']) */
      roles?: string[];
      /** Granular permissions from Auth service (e.g. ['Company.Read', 'Email.Create']) */
      permissions?: string[];
    };
    /** JWT access token from Auth service for calling microservice APIs */
    accessToken?: string;
    /** ISO timestamp when the access token expires */
    tokenExpires?: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    status: string;
    accessToken?: string;
    /** ISO timestamp when the access token expires */
    tokenExpires?: string;
    personId?: string | null;
    /** Roles from Auth service */
    roles?: string[];
    /** Granular permissions from Auth service */
    permissions?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    status: string;
    accessToken?: string;
    /** ISO timestamp when the access token expires */
    tokenExpires?: string;
    personId?: string | null;
    /** Roles from Auth service */
    roles?: string[];
    /** Granular permissions from Auth service */
    permissions?: string[];
  }
}
