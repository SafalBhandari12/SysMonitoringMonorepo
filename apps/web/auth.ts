import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboarded: boolean;
      organizationName: string | null;
    } & DefaultSession["user"];
  }
}

type AuthToken = JWT & {
  id?: string;
  emailVerified?: string | null;
  onboarded?: boolean;
  organizationName?: string | null;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const authToken = token as AuthToken;

      if (trigger === "update") {
        if (session?.onboarded !== undefined) {
          authToken.onboarded = session.onboarded;
        }
        if (session?.organizationName !== undefined) {
          authToken.organizationName = session.organizationName;
        }

        if (!session || session.onboarded === undefined) {
          const userId = authToken.id ?? authToken.sub;

          if (!userId) return authToken;

          const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              emailVerified: true,
              onboarded: true,
              organizationName: true,
            },
          });

          if (!currentUser) return authToken;

          authToken.id = currentUser.id;
          authToken.name = currentUser.name ?? null;
          authToken.image = currentUser.image ?? null;
          authToken.email = currentUser.email ?? null;
          authToken.emailVerified =
            currentUser.emailVerified?.toISOString() ?? null;
          authToken.onboarded = currentUser.onboarded;
          authToken.organizationName = currentUser.organizationName;
        }

        return authToken;
      }

      if (!user) return token;

      authToken.id = user.id;
      authToken.name = user.name ?? null;
      authToken.image = user.image ?? null;
      authToken.email = user.email ?? null;
      authToken.emailVerified =
        (
          user as { emailVerified?: Date | null }
        ).emailVerified?.toISOString() ?? null;
      authToken.onboarded = (user as any).onboarded ?? false;
      authToken.organizationName = (user as any).organizationName ?? null;

      return authToken;
    },
    async session({ session, token }) {
      const authToken = token as AuthToken;

      if (!session.user) return session;

      session.user = {
        id: String(authToken.id ?? authToken.sub ?? ""),
        name: (authToken.name as string | null | undefined) ?? null,
        image: (authToken.image as string | null | undefined) ?? null,
        email: (authToken.email as string | null | undefined) ?? "",
        emailVerified: authToken.emailVerified
          ? new Date(authToken.emailVerified)
          : null,
        onboarded: !!authToken.onboarded,
        organizationName: (authToken.organizationName as string | null | undefined) ?? null,
      };

      return session;
    },
  },
});
