import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async session({ session, user }) {
      if (!session.user || !user) return session;

      session.user = {
        id: user.id,
        onboarded: Boolean(user.onboarded),
        name: user.name,
        emailVerified: user.emailVerified,
        email: user.email,
      };
      return session;
    },
  },
});
