'use client';

import { ReactNode, useState } from 'react';
import { RiErrorWarningFill } from '@remixicon/react';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

/**
 * Handle 401 errors globally — sign out and redirect to login.
 * Works for both QueryCache (useQuery) and MutationCache (useMutation).
 */
async function handleUnauthorized(error: Error) {
  if (
    error.message?.includes('401') ||
    error.message?.includes('Unauthorized')
  ) {
    const { signOut } = await import('next-auth/react');
    signOut({ callbackUrl: '/signin', redirect: true });
    return true;
  }
  return false;
}

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: async (error) => {
            // If 401, sign out silently (no toast needed)
            if (await handleUnauthorized(error)) return;

            const message =
              error.message || 'Something went wrong. Please try again.';

            toast.custom(
              () => (
                <Alert variant="mono" icon="destructive" close={false}>
                  <AlertIcon>
                    <RiErrorWarningFill />
                  </AlertIcon>
                  <AlertTitle>{message}</AlertTitle>
                </Alert>
              ),
              {
                position: 'top-center',
              },
            );
          },
        }),
        mutationCache: new MutationCache({
          onError: async (error) => {
            // If 401, sign out silently
            await handleUnauthorized(error);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export { QueryProvider };
