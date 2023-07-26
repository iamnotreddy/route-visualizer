import { toDate } from 'date-fns';
import NextAuth from 'next-auth';
import StravaProvider from 'next-auth/providers/strava';

import { refreshAccessToken } from '@/helpers/fetchingFunctions';

const {
  NEXT_PUBLIC_STRAVA_CLIENT_ID = '',
  NEXT_PUBLIC_STRAVA_CLIENT_SECRET = '',
} = process.env;

const scopes = ['activity:read'];
export interface Token {
  accessToken: string;
  accountExpiresAt: number;
  refreshToken: string;
  error?: string;
}

export default NextAuth({
  providers: [
    StravaProvider({
      clientId: NEXT_PUBLIC_STRAVA_CLIENT_ID,
      clientSecret: NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
      authorization: {
        params: {
          scope: scopes.join(','),
          redirectUri:
            process.env.NODE_ENV === 'production'
              ? 'https://route-visualizer.vercel.app/api/auth/callback/strava'
              : `https://localhost:3000/api/auth/callback/strava`,
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ account, token }) {
      if (
        account?.access_token &&
        account.refresh_token &&
        account.expires_at
      ) {
        // request new token if current is expired
        if (new Date() >= toDate(account.expires_at * 1000)) {
          const newToken = await refreshAccessToken(
            NEXT_PUBLIC_STRAVA_CLIENT_ID,
            NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
            account.refresh_token
          );

          return {
            ...token,
            accessToken: newToken.access_token,
            refreshToken: newToken.refresh_token,
            accountExpiresAt: newToken.expires_at,
          };
        }

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accountExpiresAt: account?.expires_at,
        };
      }

      return token;
    },
  },
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
});
