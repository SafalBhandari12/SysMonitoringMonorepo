import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    emailVerified?: string | null;
  }
}

declare module "next-auth" {
  interface User extends DefaultSession["user"] {
    emailVerified?: Date | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      emailVerified?: Date | null;
    };
  }
}
