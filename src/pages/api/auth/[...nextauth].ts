import NextAuth, { NextAuthOptions } from 'next-auth';
import StravaProvider from 'next-auth/providers/strava';

const {
  NEXT_PUBLIC_STRAVA_CLIENT_ID = '',
  NEXT_PUBLIC_STRAVA_CLIENT_SECRET = '',
  NODE_ENV = '',
} = process.env;

const requestedScope = 'activity:read,activity:write,profile:read_all,read_all';

export const authOptions: NextAuthOptions = {
  providers: [
    StravaProvider({
      clientId: NEXT_PUBLIC_STRAVA_CLIENT_ID,
      clientSecret: NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
      authorization: {
        params: {
          scope: requestedScope,
          redirectUri:
            NODE_ENV === 'production'
              ? 'https://route-visualizer.vercel.app/api/auth/callback/strava'
              : `https://localhost:3000/api/auth/callback/strava`,
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token['accessToken'] = account.access_token;
      }

      if (account?.refresh_token) {
        token['refreshToken'] = account.refresh_token;
      }
      return token;
    },
  },
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
};

export default NextAuth(authOptions);
