import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import { prisma } from "./prisma";

type AuthToken = JWT & {
  id?: string;
  onboarded?: boolean;
  emailVerified?: string | null;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      const authToken = token as AuthToken;

      if (trigger === "update") {
        const userId = authToken.id ?? authToken.sub;

        if (!userId) return authToken;

        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            onboarded: true,
            name: true,
            image: true,
            email: true,
            emailVerified: true,
          },
        });

        if (!currentUser) return authToken;

        authToken.id = currentUser.id;
        authToken.onboarded = Boolean(currentUser.onboarded);
        authToken.name = currentUser.name ?? null;
        authToken.image = currentUser.image ?? null;
        authToken.email = currentUser.email ?? null;
        authToken.emailVerified =
          currentUser.emailVerified?.toISOString() ?? null;

        return authToken;
      }

      if (!user) return token;

      authToken.id = user.id;
      authToken.onboarded = Boolean(user.onboarded);
      authToken.name = user.name ?? null;
      authToken.image = user.image ?? null;
      authToken.email = user.email ?? null;
      authToken.emailVerified =
        (
          user as { emailVerified?: Date | null }
        ).emailVerified?.toISOString() ?? null;

      return authToken;
    },
    async session({ session, token }) {
      const authToken = token as AuthToken;

      if (!session.user) return session;

      session.user = {
        id: String(authToken.id ?? authToken.sub ?? ""),
        onboarded: Boolean(authToken.onboarded),
        name: (authToken.name as string | null | undefined) ?? null,
        image: (authToken.image as string | null | undefined) ?? null,
        email: (authToken.email as string | null | undefined) ?? "",
        emailVerified: authToken.emailVerified
          ? new Date(authToken.emailVerified)
          : null,
      };

      return session;
    },
  },
});
