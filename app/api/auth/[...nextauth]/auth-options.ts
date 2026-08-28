import { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginAuth } from '@/services/auth-api';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userName: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember me', type: 'boolean' },
        captchaPayload: { label: 'Captcha payload', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.userName || !credentials.password) {
          throw new Error(
            JSON.stringify({
              code: 400,
              message: 'Please enter both national code and password.',
            }),
          );
        }

        if (!credentials.captchaPayload) {
          throw new Error(
            JSON.stringify({
              code: 400,
              message: 'Captcha verification required.',
            }),
          );
        }

        let authResponse;
        try {
          authResponse = await loginAuth(
            {
              username: credentials.userName,
              password: credentials.password,
            },
            credentials.captchaPayload,
          );
        } catch (authError) {
          const message =
            authError instanceof Error
              ? authError.message
              : 'Authentication failed.';
          throw new Error(
            JSON.stringify({
              code: 401,
              message: message || 'Invalid national code or password.',
            }),
          );
        }

        // Auth-only user: session built from .NET Auth service identity
        return {
          id: authResponse.user.id,
          email: authResponse.user.email,
          name: authResponse.user.username,
          status: 'ACTIVE',
          avatar: null,
          accessToken: authResponse.token,
          tokenExpires: authResponse.tokenExpires,
          personId: authResponse.user.personId,
          roles: authResponse.roles ?? [],
          permissions: authResponse.permissions ?? [],
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({
      token,
      user,
      session,
      trigger,
    }: {
      token: JWT;
      user: User;
      session?: Session;
      trigger?: 'signIn' | 'signUp' | 'update';
    }) {
      if (trigger === 'update' && session?.user) {
        token = session.user;
      } else if (user) {
        token.id = (user.id || token.sub) as string;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.status = user.status;
        // Store Auth service access token if available
        if ('accessToken' in user && user.accessToken) {
          token.accessToken = user.accessToken as string;
        }
        // Store token expiry time
        if ('tokenExpires' in user && user.tokenExpires) {
          token.tokenExpires = user.tokenExpires as string;
        }
        // Store PersonId if available
        if ('personId' in user && user.personId) {
          token.personId = user.personId as string;
        }
        // Roles + section-level permissions from Auth service. With the new
        // section-based scheme (~22 permission Codes max), they fit comfortably
        // in the cookie. Backend still enforces via the Authorization header
        // JWT — the session copy is only for client-side menu gating.
        token.roles = (user.roles as string[]) ?? [];
        token.permissions = (user.permissions as string[]) ?? [];
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatar = token.avatar;
        session.user.status = token.status;
        session.user.personId = token.personId;
        session.user.roles = token.roles ?? [];
        session.user.permissions = token.permissions ?? [];
      }
      // Store accessToken and tokenExpires in session for API calls
      session.accessToken = token.accessToken;
      session.tokenExpires = token.tokenExpires;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
};

export default authOptions;
