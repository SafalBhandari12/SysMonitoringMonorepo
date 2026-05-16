import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboarded: boolean;
      organizationName: string | null;
      organizationUrl: string | null;
    } & DefaultSession["user"];
  }
}
