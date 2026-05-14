import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    onboarded?: boolean;
    emailVerified?: string | null;
  }
}

declare module "next-auth" {
  interface User extends DefaultSession["user"] {
    emailVerified?: Date | null;
    onboarded?: boolean;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      onboarded?: boolean;
      emailVerified?: Date | null;
    };
  }
}
