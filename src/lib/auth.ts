import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { upsertGoogleUser, getUserById } from "./user-store";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "agrosaathi-session-secret-key-development-jwt-2024",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
                scope: "openid email profile",
              },
            },
          }),
        ]
      : [
          // Fallback Google provider config if credentials missing to prevent crash
          GoogleProvider({
            clientId: "google-client-id-placeholder",
            clientSecret: "google-client-secret-placeholder",
          }),
        ]),

    // Credentials provider to support preset farmer identities and local development
    CredentialsProvider({
      id: "farmer-credentials",
      name: "Google Account Simulation",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Full Name", type: "text" },
        googleId: { label: "Google ID", type: "text" },
        avatarUrl: { label: "Avatar URL", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email.trim().toLowerCase();
        const name = credentials.name?.trim() || "Farmer";
        const googleId = credentials.googleId?.trim() || `google-user-${email.replace(/[^a-z0-9]/g, "")}`;
        const avatarUrl = credentials.avatarUrl?.trim() || "/images/ramesh-avatar.webp";

        // Upsert user into database / persistent store
        const farmerUser = await upsertGoogleUser({
          email,
          name,
          googleId,
          avatarUrl,
        });

        return {
          id: farmerUser.id,
          name: farmerUser.name,
          email: farmerUser.email,
          image: farmerUser.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          const syncedUser = await upsertGoogleUser({
            email: user.email.toLowerCase(),
            name: user.name || "Farmer",
            googleId: account.providerAccountId || (profile as any)?.sub,
            avatarUrl: user.image || undefined,
          });
          user.id = syncedUser.id;
          return true;
        } catch (err) {
          console.error("Error synchronizing Google user to AgroSaathi database:", err);
          return true; // Still allow sign in
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // If user profile is updated client-side via update()
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.location) token.location = session.location;
        if (session.acres) token.acres = session.acres;
      }

      // Populate user metadata if missing
      if (token.userId && !token.location) {
        try {
          const dbUser = await getUserById(token.userId as string);
          if (dbUser) {
            token.location = dbUser.location;
            token.acres = dbUser.acres;
            token.preferredLanguage = dbUser.preferredLanguage || "en";
            token.state = dbUser.state;
            token.district = dbUser.district;
          }
        } catch {
          // ignore
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.userId as string;
        (session.user as any).location = (token.location as string) || "Jaipur, Rajasthan";
        (session.user as any).acres = (token.acres as number) || 3.0;
        (session.user as any).preferredLanguage = (token.preferredLanguage as string) || "en";
        (session.user as any).state = (token.state as string) || "Rajasthan";
        (session.user as any).district = (token.district as string) || "Jaipur";
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};

/**
 * Server-side session verification helper.
 * Derives authenticated farmer identity directly from verified NextAuth session cookies.
 */
export async function getServerFarmerSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null;
  }
  const user = session.user as {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    location?: string;
    acres?: number;
    preferredLanguage?: string;
    state?: string;
    district?: string;
  };

  if (!user.id && user.email) {
    const existing = await upsertGoogleUser({
      email: user.email,
      name: user.name || "Farmer",
      avatarUrl: user.image || undefined,
    });
    user.id = existing.id;
  }

  return user;
}
